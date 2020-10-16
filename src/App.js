import React, { useState, useEffect } from 'react';
import List from './components/List/List';
import listIcon from './assets/images/list-icon.svg'
import AddFolderButton from './components/List/AddFolderButton/AddFolderButton';
import Tasks from './components/Tasks/Tasks';
import axios from 'axios';
import { Route, useHistory, useRouteMatch } from 'react-router-dom';

import './App.scss';

function App() {

  const [folders, setFolders] = useState([]);
  const [colors, setColors] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [isFetchingFolder, setIsFetchinFolder] = useState(false);
  const [isFetchingTask, setIsFetchinTask] = useState(false);
  const [isFetchingTaskChanging, setIsFetchingTaskChanging] = useState(false);

  let history = useHistory();  
  let match = useRouteMatch('/lists/:id');

  useEffect(() => {
    axios.get('http://localhost:3001/lists?_expand=color&_embed=tasks').then((response) => setFolders(response.data));
    axios.get('http://localhost:3001/colors').then(response => setColors(response.data));
  }, []);

  useEffect(() => {
    if(match && folders){
      const folderId = +match.params.id;
      setActiveItem(folders.find(folder => folder.id === folderId));
    }
  }, [folders, match]);

  const addFolder = (folderObj, callback) => {
    setIsFetchinFolder(true);
    axios.post('http://localhost:3001/lists', folderObj)
      .then(({ data }) => {
        const hex = (colors.find(color => color.id === data.colorId)).hex;
        setFolders([...folders, { ...data, color: { hex }, tasks: [] }])
      })
      .then(() => setIsFetchinFolder(false))
      .then(() => callback())
  };

  const removeFolder = id => {
    axios.delete('http://localhost:3001/lists/' + id)
      .then(() => {
        const newFolders = folders.filter(folder => folder.id !== id);
        setFolders(newFolders);
      })
  };

  const changeFolderName = (id, title) => {
    const newFolders = folders.map(folder => {
      if (folder.id === id) folder.name = title;
      return folder;
    })
    setFolders(newFolders);
    axios.patch('http://localhost:3001/lists/' + id, { name: title })
      .catch(error => alert('Не удалось обновить название папки' + error.message))
  }

  const addTask = (taskObj, callback) => {
    setIsFetchinTask(true)
    axios.post('http://localhost:3001/tasks', taskObj)
      .then(response => {
        const newFolders = folders.map(folder => {
          if (folder.id === taskObj.listId) folder.tasks = [...folder.tasks, response.data];
          return folder;
        });
        setFolders(newFolders);
      })
      .then(() => callback())
      .then(() => setIsFetchinTask(false))
      .catch(error => alert('Ошибка при добавлении списка /n' + error.message));
  };

  const changeTaskText = ({taskId, text}, callback) => {
    setIsFetchingTaskChanging(true);
    axios.patch(`http://localhost:3001/tasks/${taskId}`, {text})
      .then(({data}) => {
        const newFolders = folders.map(folder => {
          if(folder.id === data.listId){
            folder.tasks = folder.tasks.map(task => {
              if(task.id === data.id){
                task.text = data.text
              };
              return task;
            });
          };
          return folder;
        });
        setFolders(newFolders);
      })
      .then(() => callback())
      .then(() => setIsFetchingTaskChanging(false))
      .catch(error => alert('Ошибка при изменении задания /n' + error.message));
  }

  const changeTaskState = (taskId, completed) => {
    setIsFetchingTaskChanging(true);
    axios.patch(`http://localhost:3001/tasks/${taskId}`, {completed})
      .then(({data}) => {
        const newFolders = folders.map(folder => {
          if(folder.id === data.listId){
            folder.tasks = folder.tasks.map(task => {
              if(task.id === data.id){
                task.completed = data.completed;
              };
              return task;
            });
          };
          return folder;
        });
        setFolders(newFolders);
      })
      .then(() => setIsFetchingTaskChanging(false))
      .catch(error => alert('Ошибка при изменении задания /n' + error.message));
  }

  const removeTask = (taskId, folderId) => {
    setIsFetchingTaskChanging(true);
    axios.delete(`http://localhost:3001/tasks/${taskId}`)
      .then(() => {;
        const newFolders = folders.map(folder => {
          if(folder.id === folderId){
            folder.tasks = folder.tasks.filter(task => task.id !== taskId);
          };
          return folder;
        });
        setFolders(newFolders);
      })
      .then(() => setIsFetchingTaskChanging(true));
  };

  let closePopup = null;
  const subscibe = callback => closePopup = callback

  return (
    <div
      className="todo"
      onClick={event => closePopup(event)}
    >
      <div className="todo__sidebar sidebar">
        <List
          items={[
            {
              icon: listIcon,
              name: 'Все задачи'
            },
          ]}
          onClickItem={() => history.push(`/`)}
        />
        <List
          items={folders}
          activeItem={activeItem}
          removeFolder={removeFolder}
          onClickItem={(folder) => history.push(`/lists/${folder.id}`)}
          removable
        />
        <AddFolderButton
          colors={colors}
          addFolder={addFolder}
          isFetching={isFetchingFolder}
          subscibe={subscibe}
        />
      </div>
      <div className="todo__tasks">
        <Route exact path="/">
          {folders &&
            folders.map(folder => (
              <Tasks
                key={folder.id}
                folder={folder}
                isFetchingTask={isFetchingTask}
                isFetchingTaskChanging = {isFetchingTaskChanging}
                changeFolderName={changeFolderName}
                addTaskHandler={addTask}
                changeTaskText={changeTaskText}
                changeTaskState={changeTaskState}
                removeTask={removeTask}
                withoutEmpty
              />
            ))}
        </Route>
        <Route path='/lists/:id'>
          {folders && activeItem && (
            <Tasks
              folder={activeItem}
              isFetchingTask={isFetchingTask}
              isFetchingTaskChanging = {isFetchingTaskChanging}
              changeFolderName={changeFolderName}
              addTaskHandler={addTask}
              changeTaskText={changeTaskText}
              changeTaskState={changeTaskState}
              removeTask={removeTask}
            />
          )}
        </Route>
        {/* {activeItem && 
          <Tasks 
            isFetchingTask = {isFetchingTask}
            list = {activeItem}
            changeFolderName = {changeFolderName}
            addTaskHandler = {addTask}
          />} */}
      </div>
    </div>
  );
}

export default App;
