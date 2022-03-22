import React from 'react';
import css from './Back.module.css';
function Back({ sideChat }) {
  return <div className={sideChat ? css.dropopen : css.drop}></div>;
}

export default Back;
