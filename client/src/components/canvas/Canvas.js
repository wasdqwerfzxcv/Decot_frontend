import './Canvas.css';
import React, {useEffect, useRef, useState, useCallback} from 'react';
import Sidebar from './Sidebar';
import GridLines from './GridLines';
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuthContext } from '../../context/AuthContext';
import DrawAndErase from './DrawAndErase';
import StickyNote from './StickyNote';
import { PropertiesPanel } from './PropertiesPanel';
import { useShapes } from "./state";
import ShapeCanvas from "./ShapeCanvas";
import AddText from './AddText';
import UploadAndDisplayImage from './UploadAndDisplayImage';
import Navbar from '../common/Navbar';
import xmlbuilder from 'xmlbuilder';
import { saveCanvasData } from '../services/api.js';

const Canvas = () => {
  const { boardId, workspaceId, canvasId } = useParams();
  const drawingCanvasRef = useRef(null);
  const drawingContextRef = useRef(null);
  const stickyNoteCanvasRef = useRef(null);
  const saveInterval = useRef(null);
  const shapeCanvasRef = useRef(null);
  const shapeContextRef = useRef(null);
  const { user } = useAuthContext();
  const [isDrawing, setIsDrawing] = useState(false);
  const [isStickyNoteMode, setIsStickyNoteMode] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [isAddingImage, setIsAddingImage] = useState(null);
  const navigate = useNavigate();
  const shapes = useShapes((state)=>Object.entries(state.shapes));
  const [isAddingShape, setIsAddingShape] = useState(false);
  const stageRef=useRef(null);
  const [isAddingTextbox, setIsAddingTextbox] = useState(false);
  const textboxRef = useRef(null);
  const imageRef = useRef(null);
  const [drawingData, setDrawingData] = useState([]);
  const { token } = useAuthContext();
  const [stickyNotes, setStickyNotes] = useState([]);
  
  useEffect(()=>{
    if(user){
      navigate(`/workspace/${workspaceId}/board/${boardId}/canvas/${canvasId}`)
    }
  })
  useEffect(() => {
    const drawingCanvas = drawingCanvasRef.current;
    const drawingContext = drawingCanvas.getContext("2d");
    drawingContextRef.current = drawingContext;

    const resizeCanvas=()=>{
      const { width, height }=window.screen;
      drawingCanvas.width=width;
      drawingCanvas.height=height;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    return()=>{
      window.removeEventListener('resize', resizeCanvas);
      clearInterval(saveInterval.current);
    };
  }, [isChanged]);

  const setToDraw = () => {
    drawingContextRef.current.globalCompositeOperation = 'source-over';
  };

  const setToErase = () => {
    drawingContextRef.current.globalCompositeOperation = 'destination-out';
  };

  const addNotes = (event)=>{
    event.preventDefault();
    console.log('Note added:', event.target.elements[0].value);
    setIsAddingNote(false);
  };

  const handleAddingNote=()=>{
    setIsAddingNote(!isAddingNote);
  };

  const addStickyNote = (newNote) => {
    setStickyNotes((prevNotes) => [...prevNotes, newNote]);
  };

  const updatePosition = (noteId, newX, newY) => {
    setStickyNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === noteId ? { ...note, x: newX, y: newY } : note
      )
    );
  };

  const saveImageToLocal = (event) => {
    let link = event.currentTarget;
    link.setAttribute('download', 'canvas.png');
    let image = drawingCanvasRef.current.toDataURL('image/png');
    link.setAttribute('href', image);
  };

  const deleteCanvas = ()=>{
    const confirmDelete = window.confirm(
      "Are you sure you want to delete the drawing in the canvas?"
    );
    if(confirmDelete){
      drawingContextRef.current.clearRect(
        0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height
      );
    }
  };

  const handleUploadAndDisplay = () => {
    setIsAddingImage(!isAddingImage);
  };

  const handleAddingShape=()=>{
    setIsAddingShape(!isAddingShape);
  };

  const addShape = (event)=>{
    event.preventDefault();
    console.log('Shape added:', event.target.elements[0].value);
    setIsAddingShape(false);
  };

  const handleAddingTextbox=()=>{
    setIsAddingTextbox(!isAddingTextbox);
  };

  const addText = (event)=>{
    event.preventDefault();
    console.log('Text added:', event.target.elements[0].value);
    setIsAddingTextbox(false);
  };

  const serializeDrawingDataToXml = () => {
    const root = xmlbuilder.create('drawingData');
    if(Array.isArray(drawingData)){
      drawingData.forEach(({ type, x, y }) => {
        root
          .ele('drawOperation')
          .att('type', type)
          .ele('x')
          .txt(x.toString())
          .up()
          .ele('y')
          .txt(y.toString())
          .up()
          .up();
      });
    }else{
      console.error('Drawing data is not an array: ', drawingData);
    }

    return root.end({ pretty: true });
  };

  const handleSaveCanvas = async() => {
    const serializeDrawingDataXml = serializeDrawingDataToXml();
    console.log('Serialized Drawing Data (XML):', serializeDrawingDataXml);
    try {
      const data = await saveCanvasData(token, boardId, canvasId, workspaceId, serializeDrawingDataXml);
      setDrawingData(data);
      console.log('Data saved successfully:', data);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  return (
    <div>
      <Navbar />
      <Sidebar
        setToDraw={setToDraw}
        setToErase={setToErase}
        handleAddingNote={handleAddingNote}
        deleteCanvas={deleteCanvas}
        saveImageToLocal={saveImageToLocal}
        handleUploadAndDisplay={handleUploadAndDisplay}
        handleAddingShape={handleAddingShape}
        handleAddingTextbox={handleAddingTextbox}
        handleSaveCanvas={handleSaveCanvas}
      />
      <DrawAndErase 
        drawingCanvasRef={drawingCanvasRef}
        drawingContextRef={drawingContextRef}
        isDrawing={isDrawing}
        setIsDrawing={setIsDrawing}
        setIsChanged={setIsChanged}
        isStickyNoteMode={isStickyNoteMode}
        setDrawingData={setDrawingData}
      />
      {isAddingNote&&(
        <StickyNote
          drawingCanvasRef={drawingCanvasRef}
          isAddingNote={isAddingNote}
          addNote={addNotes}
          updatePosition={updatePosition}
        />
      )}
      {isAddingShape&&(
        <ShapeCanvas 
          stageRef={stageRef}
          handleAddingShape={handleAddingShape}
          addShape={addShape}
      />
      )}
      {isAddingTextbox&&(
        <AddText 
          textboxRef={textboxRef}
          handleAddingTextbox={handleAddingTextbox}
          AddText={addText}
      />
      )}
      {isAddingImage&&(
        <UploadAndDisplayImage 
          imageRef={imageRef}
          handleUploadAndDisplay={handleUploadAndDisplay}
      />
      )}
      {/* <PropertiesPanel />*/}
    </div>
  );
};

export default Canvas;