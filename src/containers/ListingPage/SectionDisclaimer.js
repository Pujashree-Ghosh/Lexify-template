import React from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import { richText } from '../../util/richText';

import css from './ListingPage.module.css';

const MIN_LENGTH_FOR_LONG_WORDS_IN_DISCLAIMER = 20;

const sectionDisclaimer = props => {
  const { publicData } = props;
  return publicData.disclaimer ? (
    <div className={css.sectionDescription}>
      <h2 className={css.descriptionTitle}>
        <FormattedMessage id="ListingPage.disclaimerTitle" />
      </h2>
      <p className={css.description}>
        {richText(publicData.disclaimer, {
          longWordMinLength: MIN_LENGTH_FOR_LONG_WORDS_IN_DISCLAIMER,
          longWordClass: css.longWord,
        })}
      </p>
    </div>
  ) : null;
};

export default sectionDisclaimer;
