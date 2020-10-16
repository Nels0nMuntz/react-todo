import React, { useState } from 'react'
import classnames from 'classnames'

import addIcon from './../../../assets/images/add-icon.svg'

import style from './AddTaskForm.module.scss'



export default function AddTaskForm({ listId, addTaskHandler, isFetching }) {

    const [editMode, setEditMode] = useState(false);
    const [taskText, setTaskText] = useState('');

    const isEmpty = (string) =>  string && (string.replace(/\s/g, '')) ? false : true;

    const closeEditMode = () => {
        setTaskText('');
        setEditMode(false)
    };

    const onBlurInput = event => {
        if (event.relatedTarget && (event.relatedTarget.classList.contains('add-btn') || event.relatedTarget.classList.contains('cancel-btn'))) return;
        if (!isEmpty(taskText)) {
            let question = window.confirm('Хотите сохранить новую задачу ?');
            if (question) {
                addTask();
            } else {
                closeEditMode();
            };
        }else{
            closeEditMode();
        }        
    };

    const addTask = () => {
        if (!isEmpty(taskText)) {
            addTaskHandler({
                listId,
                text: taskText,
                completed: false
            }, closeEditMode);
        }
    };


    return (
        <div className={style.tasks__form}>
            {editMode ? (
                <div className={style.tasks__form_add}>
                    <input
                        type='text'
                        placeholder='Текст задачи'
                        value={taskText}
                        onChange={event => setTaskText(event.target.value)}
                        onBlur={onBlurInput}
                        autoFocus={true}
                    />
                    <button
                        className={classnames(
                            'main-btn',
                            'add-btn',
                            { 'disabled': isFetching }
                        )}
                        onClick={addTask}
                        disabled = {isFetching ? true : false}
                    >{isFetching ? 'Добавление...' : 'Добавить задачу'}</button>
                    <button
                        className='main-btn cancel-btn'
                        onClick={closeEditMode}
                    >Отмена</button>
                </div>
            ) : (
                    <div
                        className={style.tasks__form_new}
                        onClick={() => setEditMode(true)}
                    >
                        <img src={addIcon} alt='Add icon' />
                        <span>Новая задача</span>
                    </div>
                )}
        </div>
    )
}
