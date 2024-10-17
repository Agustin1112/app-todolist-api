import React, { useState, useEffect } from 'react';

const TodoApp = () => {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [userExists, setUserExists] = useState(true);

  const USER_ID = 'agustinp1';

  // Función para crear el usuario
  const createUser = async () => {
    try {
      const response = await fetch('https://playground.4geeks.com/todo/users/agustinp', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: USER_ID }),
      });

      if (response.status === 201) {
        console.log('Usuario creado:', USER_ID);
        setUserExists(true);
      } else if (response.status === 422) {
        console.log('El usuario ya existe:', USER_ID);
        setUserExists(true);
      } else {
        setUserExists(false);
      }
    } catch (error) {
      console.error('Error creando usuario:', error);
      setUserExists(false);
    }
  };

  // Función para cargar tareas desde la API
  const loadTasks = async () => {
    try {
      const response = await fetch(`https://playground.4geeks.com/todo/users/agustinp`);
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.todos)) {
          setTasks(data.todos);
        }
      } else {
        setUserExists(false);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setUserExists(false);
    }
  };

  // Llamamo a createUser y loadTasks
  useEffect(() => {
    const initializeUser = async () => {
      await createUser();
      loadTasks();
    };

    initializeUser();
  }, []);

  // Función para agregar una nueva tarea
  const addTask = () => {
    if (inputValue.trim() !== '') {
      const newTask = { label: inputValue.trim(), is_done: false };
      setTasks(prevTasks => [...prevTasks, newTask]);
      addTaskToServer(newTask);
      setInputValue('');
    }
  };

  // Función para agregar una tarea al servidor
  const addTaskToServer = async (task) => {
    try {
      const response = await fetch(`https://playground.4geeks.com/todo/users/agustinp`, {
        method: 'POST',
        body: JSON.stringify(task),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Tarea agregada:', data);
      } else {
        console.error('Error al agregar tarea:', await response.json());
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // Función para eliminar una tarea
  const handleDelete = (index) => {
    const taskId = tasks[index].id;
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
    deleteTaskFromServer(taskId);
  };

  // Función para eliminar una tarea del servidor
  const deleteTaskFromServer = async (taskId) => {
    try {
      const response = await fetch(`https://playground.4geeks.com/todo/todos/${USER_ID}/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Tarea eliminada:', data);
      } else {
        console.error('Error al eliminar tarea:', await response.json());
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  
  const clearTasks = () => {
    setTasks([]);
    
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>todos</h1>
      {userExists ? (
        <div style={styles.todoBox}>
          <input
            type="text"
            placeholder="What needs to be done?"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' ? addTask() : null}
            style={styles.input}
          />
          <ul style={styles.taskList}>
            {tasks.length === 0 ? (
              <li style={styles.noTasks}>No hay tareas, añadir tareas</li>
            ) : (
              tasks.map((task, index) => (
                <li
                  key={index}
                  style={styles.taskItem}
                >
                  {task.label}
                  <button
                    onClick={() => handleDelete(index)}
                    style={styles.deleteButton}
                  >
                    🗑️
                  </button>
                </li>
              ))
            )}
          </ul>
          <div style={styles.footer}>
            {tasks.length} {tasks.length === 1 ? 'item' : 'items'} left
          </div>
          <button onClick={clearTasks} style={styles.clearButton}>
            Clear All
          </button>
        </div>
      ) : (
        <div style={styles.errorMessage}>El usuario no existe. Por favor, crea un usuario válido.</div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '72px',
    color: '#e6e6e6',
    position: 'absolute',
    top: '20px',
    textAlign: 'center',
    width: '100%',
  },
  todoBox: {
    background: 'white',
    width: '400px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    borderRadius: '4px',
    padding: '20px',
  },
  input: {
    width: '100%',
    padding: '15px',
    border: 'none',
    fontSize: '18px',
    boxSizing: 'border-box',
    outline: 'none',
    borderBottom: '2px solid #ededed',
  },
  taskList: {
    listStyleType: 'none',
    paddingLeft: 0,
    marginTop: '20px',
  },
  noTasks: {
    textAlign: 'center',
    color: '#d9d9d9',
    fontStyle: 'italic',
  },
  taskItem: {
    padding: '15px 10px',
    borderBottom: '1px solid #ededed',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '18px',
    transition: 'background 0.3s',
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#cc9a9a',
  },
  footer: {
    textAlign: 'left',
    fontSize: '14px',
    color: '#777',
    marginTop: '20px',
  },
  clearButton: {
    marginTop: '20px',
    padding: '10px',
    backgroundColor: '#ffcccb',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
  },
};

export default TodoApp;









