import React, { useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import { IoIosArrowUp } from 'react-icons/io';
import css from './ReadmoreButton.module.css';

const BIO_COLLAPSED_LENGTH = 170;

const collapsed = s => {
  return s?.length > BIO_COLLAPSED_LENGTH ? s.substring(0, BIO_COLLAPSED_LENGTH) + '...' : s;
};

function ReadmoreButton(props) {
  const desc = props.description;
  const [expand, setexpand] = useState(true);
  return (
    <div>
      <div className={css.destxt}>{expand ? collapsed(desc) : desc}</div>
      <div>
        {desc?.length >= BIO_COLLAPSED_LENGTH ? (
          <div
            className={css.showdisbth}
            // style={{
            //   color: '#a91722',
            //   paddingTop: '20px',
            //   paddingBottom: '10px',
            //   fontWeight: '600',
            //   cursor: 'pointer',
            // }}
            onClick={() => {
              setexpand(!expand);
              // console.log(expand);
            }}
          >
            {expand ? (
              <div>
                <IoIosArrowDown />
                SHOW MORE
              </div>
            ) : (
              <div>
                <IoIosArrowUp />
                SHOW LESS
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ReadmoreButton;
