import React, { useState, useEffect } from "react";

const TodoApp = () => {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [userExists, setUserExists] = useState(true);
  const USER_ID = "agustinp";

  // Función para cargar las tareas desde el servidor
  const loadTasks = async () => {
    try {
      const response = await fetch(`https://playground.4geeks.com/todo/users/${USER_ID}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Datos del servidor:", data); // Verifica los datos recibidos
        if (Array.isArray(data.todos)) {
          setTasks(data.todos);
          console.log("Tareas cargadas:", data.todos); // Verifica las tareas cargadas
        } else {
          console.error("Formato de datos inesperado:", data);
        }
      } else {
        console.error("Error al cargar tareas:", response.status);
        setUserExists(false);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setUserExists(false);
    }
  };

  useEffect(() => {
    const checkUserExists = async () => {
      console.log("Componente montado, verificando usuario...");
      try {
        const response = await fetch(`https://playground.4geeks.com/todo/users/${USER_ID}`);

        if (response.ok) {
          setUserExists(true);
          await loadTasks();
        } else if (response.status === 404) {
          const userCreated = await createUser();
          if (userCreated) {
            await loadTasks();
          }
        } else {
          console.error("Error al verificar el usuario:", response.status);
          setUserExists(false);
        }
      } catch (error) {
        console.error("Error checking user existence:", error);
        setUserExists(false);
      }
    };

    const createUser = async () => {
      try {
        const response = await fetch(`https://playground.4geeks.com/todo/users/${USER_ID}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok || response.status === 422) {
          console.log("Usuario creado o ya existe:", USER_ID);
          return true;
        } else {
          console.error("Error al crear usuario:", await response.json());
          return false;
        }
      } catch (error) {
        console.error("Error creando usuario:", error);
        return false;
      }
    };

    checkUserExists();
  }, []);

  const addTaskToServer = async (task) => {
    try {
      const response = await fetch(`https://playground.4geeks.com/todo/todos/${USER_ID}`, {
        method: "POST",
        body: JSON.stringify(task),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        console.log("Tarea agregada con éxito");
        await loadTasks(); // Ahora loadTasks está definida y accesible
      } else {
        console.error("Error al agregar tarea:", await response.json());
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const deleteTaskFromServer = async (taskId) => {
    try {
      const response = await fetch(`https://playground.4geeks.com/todo/todos/${taskId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!response.ok) {
        const errorMessage = await response.text(); // Capturar mensaje de error del servidor
        console.error("Error al eliminar tarea:", response.status, errorMessage);
      } else {
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
        console.log(`Tarea ${taskId} eliminada con éxito`);
      }
    } catch (error) {
      console.error("Error eliminando la tarea:", error.message);
    }
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
            onKeyPress={async (e) => {
              if (e.key === "Enter" && inputValue.trim() !== "") {
                const newTask = {
                  label: inputValue.trim(),
                  is_done: false,
                };

                await addTaskToServer(newTask);
                setInputValue("");
              }
            }}
            style={styles.input}
          />
          <ul style={styles.taskList}>
            {tasks.length === 0 ? (
              <li style={styles.noTasks}>No hay tareas, añadir tareas</li>
            ) : (
              tasks.map((task) => (
                <li key={task.id} style={styles.taskItem}>
                  {task.label}
                  <button
                    onClick={async () => {
                      await deleteTaskFromServer(task.id);
                    }}
                    style={styles.deleteButton}
                  >
                    🗑️
                  </button>
                </li>
              ))
            )}
          </ul>
          <div style={styles.footer}>
            {tasks.length} {tasks.length === 1 ? "item" : "items"} left
          </div>
        </div>
      ) : (
        <div style={styles.errorMessage}>
          El usuario no existe. Por favor, crea un usuario válido.
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "72px",
    color: "#e6e6e6",
    position: "absolute",
    top: "20px",
    textAlign: "center",
    width: "100%",
  },
  todoBox: {
    background: "white",
    width: "400px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    borderRadius: "4px",
    padding: "20px",
  },
  input: {
    width: "100%",
    padding: "15px",
    border: "none",
    fontSize: "18px",
    boxSizing: "border-box",
    outline: "none",
    borderBottom: "2px solid #ededed",
  },
  taskList: {
    listStyleType: "none",
    paddingLeft: 0,
    marginTop: "20px",
  },
  noTasks: {
    textAlign: "center",
    color: "#d9d9d9",
    fontStyle: "italic",
  },
  taskItem: {
    padding: "15px 10px",
    borderBottom: "1px solid #ededed",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "18px",
    transition: "background 0.3s",
  },
  deleteButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    color: "#cc9a9a",
  },
  footer: {
    textAlign: "left",
    fontSize: "14px",
    color: "#777",
    marginTop: "20px",
  },
  errorMessage: {
    color: "red",
    textAlign: "center",
  },
};

export default TodoApp;


