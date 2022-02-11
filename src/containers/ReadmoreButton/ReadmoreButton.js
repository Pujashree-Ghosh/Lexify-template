import React, { useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import { IoIosArrowUp } from 'react-icons/io';

const BIO_COLLAPSED_LENGTH = 170;

const collapsed = s => {
  return s.length > BIO_COLLAPSED_LENGTH ? s.substring(0, BIO_COLLAPSED_LENGTH) + '...' : s;
};

function ReadmoreButton(props) {
  const desc = props.description;
  const [expand, setexpand] = useState(true);
  return (
    <div>
      <p>{expand ? collapsed(desc) : desc}</p>
      <div>
        {desc.length >= BIO_COLLAPSED_LENGTH ? (
          <p
            style={{ color: '#a91722' }}
            onClick={() => {
              setexpand(!expand);
              // console.log(expand);
            }}
          >
            {expand ? (
              <p>
                <IoIosArrowDown />
                SHOW MORE
              </p>
            ) : (
              <p>
                <IoIosArrowUp />
                SHOW LESS
              </p>
            )}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default ReadmoreButton;
