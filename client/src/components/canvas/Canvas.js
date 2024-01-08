import './Canvas.css';
import React, { useEffect, useRef, useState, useCallback, useReducer } from 'react';
import Sidebar from './Sidebar';
import GridLines from './GridLines';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import DrawAndErase from './DrawAndErase';
import StickyNote from './StickyNote';
import { PropertiesPanel } from './PropertiesPanel';
import PropertiesPanelButton from './PropertiesPanelButton';
import { useShapes, createCircle, createRectangle, clearSelection } from "./state";
import AddText from './AddText';
import UploadAndDisplayImage from './UploadAndDisplayImage';
import Navbar from '../common/Navbar';
import xmlbuilder from 'xmlbuilder';
import { uploadCanvas } from '../services/api';
import CommentPanel from './CommentPanel';
import CommentButton from './CommentButton';
import DraggableCommentIcon from './DraggableCommentIcon';
import CommentDetailBox from './CommentDetailBox';
import { updateComment, getCommentsByCanvas } from '../services/api';
import { Layer, Stage } from "react-konva";
import { SHAPE_TYPES } from "./constants";
import Shape from "./Shape";

const initialNoteState = {
  lastNoteCreated: null,
  totalNotes: 0,
  notes: [],
};

const notesReducer = (prevState, action) => {
  switch (action.type) {
    case 'ADD_NOTE': {
      const newState = {
        lastNoteCreated: new Date().toTimeString().slice(0, 8),
        totalNotes: prevState.notes.length + 1,
        notes: [...prevState.notes, action.payload]
      };
      console.log('After ADD_NOTE: ', newState);
      return newState;
    }
    case 'DELETE_NOTE': {
      const newState = {
        ...prevState,
        totalNotes: prevState.notes.length - 1,
        notes: prevState.notes.filter(note => note.id !== action.payload.id),
      };
      console.log('After DELETE_NOTE: ', newState);
      return newState;
    }
    case 'UPDATE_POSITION': {
      return {
        ...prevState,
        notes: prevState.notes.map(note =>
          note.id === action.payload.id
            ? { ...note, x: action.payload.x, y: action.payload.y }
            : note
        )
      };
    }
  }
};

const Canvas = () => {
  const { boardId, workspaceId, canvasId } = useParams();
  const drawingCanvasRef = useRef(null);
  const drawingContextRef = useRef(null);
  const saveInterval = useRef(null);
  const { user, token } = useAuthContext();
  const [isStickyNoteMode, setIsStickyNoteMode] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [isAddingImage, setIsAddingImage] = useState(null);
  const navigate = useNavigate();
  const shapes = useShapes((state) => Object.entries(state.shapes));
  const [isAddingShape, setIsAddingShape] = useState(false);
  const [isAddingTextbox, setIsAddingTextbox] = useState(false);
  const imageRef = useRef(null);
  const [drawingData, setDrawingData] = useState([]);
  const [stickyNotes, setStickyNotes] = useState([]);
  const [commentPanelOpen, setCommentPanelOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [activeCommentPosition, setActiveCommentPosition] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [canvasSize, setCanvasSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [selectedShapeType, setSelectedShapeType] = useState(null);
  const [isPropertiesPanelOpen, setIsPropertiesPanelOpen] = useState(false);
  const [textboxes, setTextboxes] = useState([]);
  const [notesState, dispatch] = useReducer(notesReducer, initialNoteState);
  const [activeCommentId, setActiveCommentId] = useState(null);

  const activeComment = comments.find(comment => comment.id === activeCommentId);

  const updateStickyNotes = (action) => {
    dispatch(action);
  };

  useEffect(() => {
    if (user) {
      navigate(`/workspace/${workspaceId}/board/${boardId}/canvas/${canvasId}`)
    }
  }, [user, navigate, workspaceId, boardId, canvasId]);

  useEffect(() => {
    const drawingCanvas = drawingCanvasRef.current;
    const drawingContext = drawingCanvas.getContext("2d");
    drawingContextRef.current = drawingContext;

    const resizeCanvas = () => {
      //const { width, height } = window.screen;
      const width = window.innerWidth;
      const height = window.innerHeight;
      drawingCanvas.width = width;
      drawingCanvas.height = height;
      setCanvasSize({ width, height });
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      clearInterval(saveInterval.current);
    };
  }, [isChanged]);

  useEffect(() => {
    fetchComments();
  }, [canvasId, token]);

  const activateDrawingMode = () => {
    drawingContextRef.current.globalCompositeOperation = 'source-over';
  };

  const activateErasingMode = () => {
    drawingContextRef.current.globalCompositeOperation = 'destination-out';
    setIsAddingNote(false);
  };

  const addNotes = (event) => {
    event.preventDefault();
    console.log('Note added:', event.target.elements[0].value);
    setIsAddingNote(false);
    setIsDrawing(false);
  };

  const handleAddingNote = () => {
    setIsAddingNote(!isAddingNote);
    setIsDrawing(false);
  };

  const saveImageToLocal = (event) => {
    let link = event.currentTarget;
    link.setAttribute('download', 'canvas.png');
    let image = drawingCanvasRef.current.toDataURL('image/png');
    link.setAttribute('href', image);
  };

  const deleteCanvas = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete the drawing in the canvas?"
    );
    if (confirmDelete) {
      drawingContextRef.current.clearRect(
        0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height
      );
    }
  };

  const handleUploadAndDisplay = () => {
    setIsAddingImage(!isAddingImage);
  };

  const handleAddingShape = () => {
    setIsAddingShape(!isAddingShape);
  };

  const handleSelectShape = (shapeType) => {
    console.log("Shape selected in palette: ", shapeType);
    setSelectedShapeType(shapeType);
  };

  const handleAddingTextbox = () => {
    setIsAddingTextbox(!isAddingTextbox);
    setIsDrawing(false);
  };

  const addText = (event) => {
    event.preventDefault();
    console.log('Text added:', event.target.elements[0].value);
    setIsAddingTextbox(false);
  };

  const serializeDrawingDataToXml = (drawingData, textboxes, stickyNotes) => {
    const root = xmlbuilder.create('drawingData');
    // Process drawingData if it exists and is not empty
    if (Array.isArray(drawingData) && drawingData.length > 0) {
      drawingData.forEach(({ type, x, y }) => {
        root.ele('drawOperation')
          .att('type', type)
          .ele('x').txt(x.toString()).up()
          .ele('y').txt(y.toString()).up()
          .up();
      });
    }

    // Process textboxes if they exist and are not empty
    if (Array.isArray(textboxes) && textboxes.length > 0) {
      textboxes.forEach(({ id, text, width, height, position }) => {
        root.ele('textbox')
          .att('id', id)
          .ele('text').txt(text).up()
          .ele('width').txt(width.toString()).up()
          .ele('height').txt(height.toString()).up()
          .ele('position')
          .ele('x').txt(position.x.toString()).up()
          .ele('y').txt(position.y.toString()).up()
          .up().up();
      });
    }

    // Process stickyNotes if they exist and are not empty
    if (Array.isArray(stickyNotes) && stickyNotes.length > 0) {
      stickyNotes.forEach(({ id, text, x, y, width, height }) => {
        root.ele('stickyNote')
          .att('id', id)
          .ele('text').txt(text).up()
          .ele('width').txt(width.toString()).up()
          .ele('height').txt(height.toString()).up()
          .ele('position')
          .ele('x').txt(x.toString()).up()
          .ele('y').txt(y.toString()).up()
          .up().up();
      });
    }
    return root.end({ pretty: true });
  };

  const handleSaveCanvas = async () => {
    const serializeDrawingDataXml = serializeDrawingDataToXml(drawingData, textboxes, notesState.notes);
    console.log('Serialized Drawing Data (XML):', serializeDrawingDataXml);
    const xmlBlob = new Blob([serializeDrawingDataXml], { type: 'text/xml' });
    const xmlFile = new File([xmlBlob], "canvas-data.xml", { type: 'text/xml' });
    try {
      const data = await uploadCanvas(token, boardId, canvasId, workspaceId, xmlFile);
      console.log('XML FILE: ', xmlFile);
      setDrawingData(xmlFile);
      console.log('Data saved successfully:', data);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const toggleCommentPanel = (commentPanelOpen) => {
    setCommentPanelOpen(!commentPanelOpen);
  };

  const handleActiveComment = (comment, position) => {
    setActiveCommentId(comment.id);
    setActiveCommentPosition(position);
  };

  const unresolvedComments = comments.filter(comment => !comment.resolved);

  const handleAddNewComment = (newComment) => {
    setComments([...comments, newComment]);
  };

  const handleDeleteComment = (deletedCommentId) => {
    setComments(currentComments => {
      return currentComments.reduce((updatedComments, comment) => {
        if (comment.id === deletedCommentId) {
          if (activeComment && activeComment.id === deletedCommentId) {
            setActiveCommentId(null);
          }
          return updatedComments;
        }

        if (comment.replies && comment.replies.some(reply => reply.id === deletedCommentId)) {
          const updatedReplies = comment.replies.filter(reply => reply.id !== deletedCommentId);
          const updatedParentComment = { ...comment, replies: updatedReplies };

          if (activeComment && activeComment.id === comment.id) {
            setActiveCommentId(updatedParentComment.id);
          }

          updatedComments.push(updatedParentComment);
          return updatedComments;
        }

        updatedComments.push(comment);
        return updatedComments;
      }, []);
    });
  };


  const handlePositionChange = async (commentId, newPosition) => {
    const commentToUpdate = comments.find(c => c.id === commentId);

    if (commentToUpdate) {
      const response = await updateComment(token, workspaceId, boardId, canvasId, commentId, commentToUpdate.text, newPosition.x, newPosition.y);

      if (response.status === 200) {
        if (activeComment && activeComment.id === commentId) {
          setActiveCommentPosition(newPosition);
        }
        setComments(currentComments =>
          currentComments.map(comment =>
            comment.id === commentId ? { ...comment, x: newPosition.x, y: newPosition.y } : comment
          )
        );
      } else {
        console.error('Failed to update comment position:', response.error);
      }
    }
  };

  const fetchComments = async () => {
    const response = await getCommentsByCanvas(token, workspaceId, boardId, canvasId);
    console.log(response)
    if (response.status === 200) {
      setComments(response.comments);
    } else {
      console.error('Error fetching comments:', response.error);
    }
  };

  const handleCommentResolvedToggle = (updatedComment) => {
    setComments(currentComments =>
        currentComments.map(comment => {
            if (comment.id === updatedComment.id) {
                return {
                    ...comment,
                    resolved: updatedComment.resolved
                };
            }
            return comment;
        })
    );
};

  const togglePropertiesPanel = () => {
    setIsPropertiesPanelOpen(!isPropertiesPanelOpen);
  };

  useEffect(() => {
    if (selectedShapeType) {
      const defaultPosition = { x: 100, y: 100 };
      if (selectedShapeType === SHAPE_TYPES.RECT) {
        createRectangle(defaultPosition);
      } else if (selectedShapeType === SHAPE_TYPES.CIRCLE) {
        createCircle(defaultPosition);
      }
      setSelectedShapeType(null); // Reset selected shape type
    }
  }, [selectedShapeType]);

  const handleUpdateComment = (updatedComment) => {
    setComments(currentComments => {
      return currentComments.map(comment => {
        if (comment.id === updatedComment.id) {
          return updatedComment;
        }

        // Handle nested replies
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(reply => {
              if (reply.id === updatedComment.id) {
                return updatedComment;
              }
              return reply;
            }),
          };
        }

        return comment;
      });
    });

    if (activeComment && (activeComment.id === updatedComment.id ||
      (activeComment.id === updatedComment.parentId))) {
      setActiveCommentId(updatedComment.id);
    }
  };

  return (
    <div>
      <Navbar />
      <Sidebar
        handleAddingNote={handleAddingNote}
        deleteCanvas={deleteCanvas}
        saveImageToLocal={saveImageToLocal}
        handleUploadAndDisplay={handleUploadAndDisplay}
        handleAddingShape={handleAddingShape}
        handleAddingTextbox={handleAddingTextbox}
        handleSaveCanvas={handleSaveCanvas}
        isDrawing={isDrawing}
        setIsDrawing={setIsDrawing}
        setIsErasing={setIsErasing}
        onSelectShape={handleSelectShape}
        activateDrawingMode={activateDrawingMode}
        activateErasingMode={activateErasingMode}
      />
      {/* <div className="canvas-container"> */}
      <Stage drawingCanvasRef={drawingCanvasRef} width={canvasSize.width} height={canvasSize.height}>
        <Layer>
          {shapes.map(([key, shape]) => {
            //console.log("Rendering shape", shape);
            return <Shape key={key} shape={{ ...shape, id: key }} />;
          })}
        </Layer>
      </Stage>

      <DrawAndErase
        drawingCanvasRef={drawingCanvasRef}
        drawingContextRef={drawingContextRef}
        setIsChanged={setIsChanged}
        isStickyNoteMode={isStickyNoteMode}
        setDrawingData={setDrawingData}
        isDrawing={isDrawing}
        setIsDrawing={setIsDrawing}
        setIsErasing={setIsErasing}
      />
      <CommentButton onClick={() => toggleCommentPanel(commentPanelOpen)} />
      <CommentPanel
        token={token}
        workspaceId={workspaceId}
        boardId={boardId}
        canvasId={canvasId}
        isOpen={commentPanelOpen}
        onClose={() => setCommentPanelOpen(false)}
        onAddComment={handleAddNewComment}
        onDeleteComment={handleDeleteComment}
        onToggleResolved={handleCommentResolvedToggle}
        onUpdateComment={handleUpdateComment}
        onRefresh={() => fetchComments()}
      />
      <StickyNote
        drawingCanvasRef={drawingCanvasRef}
        isAddingNote={isAddingNote}
        addNote={addNotes}
        setStickyNotes={setStickyNotes}
        setIsDrawing={setIsDrawing}
        updateStickyNotes={updateStickyNotes}
        notesState={notesState}
      />
      <AddText
        drawingCanvasRef={drawingCanvasRef}
        handleAddingTextbox={handleAddingTextbox}
        isAddingTextbox={isAddingTextbox}
        AddText={addText}
        textboxes={textboxes}
        setTextboxes={setTextboxes}
      />
      {isAddingImage && (
        <UploadAndDisplayImage
          imageRef={imageRef}
          handleUploadAndDisplay={handleUploadAndDisplay}
        />
      )}
      {/* Render the comments as draggable boxes */}
      {unresolvedComments.map((comment) => (
        <DraggableCommentIcon
          key={comment.id}
          comment={comment}
          onSelectComment={handleActiveComment}
          onPositionChange={handlePositionChange}
        />
      ))}

      {activeComment && (
        <CommentDetailBox
          comment={activeComment}
          position={activeCommentPosition}
          onClose={() => setActiveCommentId(null)}
        />
      )}
      <PropertiesPanelButton onClick={() => togglePropertiesPanel(isPropertiesPanelOpen)} />
      {isPropertiesPanelOpen && <PropertiesPanel />}
      {/* </div> */}
    </div>
  );
};

export default Canvas;