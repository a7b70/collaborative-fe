import React, { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function Canvas() {
  const canvasRef = useRef(null);
  const [squares, setSquares] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const squareSize = 70; // Fixed size for each square
  

  useEffect(() => {
    socket.on('draw', (newSquares) => {
        setSquares(newSquares); // Update local state when new data is received from the server
    });

    return () => {
        socket.off('draw');
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    canvas.style.width ='100%';
    canvas.style.height='100%';
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const drawSquares = () => {
      context.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before drawing.
      squares.forEach(square => {
        context.beginPath();
        context.rect(square.x, square.y, squareSize, squareSize);
        context.fillStyle = 'yellow';
        context.fill();
        context.stroke();
        if (square.text) {
          drawText(square, context);
        }
      });
    };

    const drawText = (square, context) => {
      context.font = 'bold 10px Arial';
      context.fillStyle = 'black';
      context.textBaseline = 'top';
      wrapText(context, square.text, square.x + 5, square.y + 5, squareSize - 10, 14);
    };

    const wrapText = (context, text, x, y, maxWidth, lineHeight) => {
      if (text) {
        const words = text.split(' ');
        let line = '';

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = context.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
          } else {
            line = testLine;
          }
        }
        context.fillText(line, x, y);
      }
    };

    const handleMouseDown = (e) => {
      const x = e.pageX - canvas.offsetLeft;
      const y = e.pageY - canvas.offsetTop;

      const clickedSquare = squares.find(square =>
        x >= square.x && x <= square.x + squareSize && y >= square.y && y <= square.y + squareSize
      );

      if (clickedSquare) {
        if (e.ctrlKey) {
          const updatedSquares = squares.filter(square => square.id !== clickedSquare.id);
          setSquares(updatedSquares);
        } else {
          setDragging(true);
          setSelectedSquare(clickedSquare);
        }
      } else {
        const text = prompt("Enter text for the square (max 20 chars):") || ""; // Default to empty string if canceled
        const newSquare = {
          x: x - (squareSize / 2),
          y: y - (squareSize / 2),
          id: Math.random(),
          text: text.substring(0, 70) // Limit text to 70 characters
        };
        setSquares([...squares, newSquare]);
        socket.emit('draw', [...squares, newSquare]);
      }
    };

    const handleMouseMove = (e) => {
      if (dragging && selectedSquare) {
        const newX = e.pageX - canvas.offsetLeft - (squareSize / 2);
        const newY = e.pageY - canvas.offsetTop - (squareSize / 2);
        setSquares(squares.map(square =>
          square.id === selectedSquare.id ? { ...square, x: newX, y: newY } : square
        ));
      }
    };

    const handleMouseUp = () => {
      setDragging(false);
      setSelectedSquare(null);
      // Emit the current state of squares to all other clients
      socket.emit('draw', squares);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    drawSquares();

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [squares, dragging, selectedSquare]);

  return <div>
    <canvas ref={canvasRef} />
  </div>;
}

export default Canvas;
