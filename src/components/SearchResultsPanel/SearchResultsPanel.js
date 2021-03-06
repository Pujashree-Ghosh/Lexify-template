import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { propTypes } from '../../util/types';
import { ListingCard, PaginationLinks } from '../../components';
import css from './SearchResultsPanel.module.css';
import UserResultCard from '../UserResultCard/UserResultCard';
import ListingResultCard from '../ListingResultCard/ListingResultCard';

const SearchResultsPanel = props => {
  const {
    className,
    rootClassName,
    listings,
    pagination,
    search,
    setActiveListing,
    history,
    totalItems,
  } = props;
  const classes = classNames(rootClassName || css.root, className);

  const paginationLinks =
    pagination && pagination.totalPages > 1 ? (
      <PaginationLinks
        className={css.pagination}
        pageName="SearchPage"
        pageSearchParams={search}
        pagination={pagination}
      />
    ) : null;

  // Panel width relative to the viewport
  const panelMediumWidth = 50;
  const panelLargeWidth = 62.5;
  const cardRenderSizes = [
    '(max-width: 767px) 100vw',
    `(max-width: 1023px) ${panelMediumWidth}vw`,
    `(max-width: 1920px) ${panelLargeWidth / 2}vw`,
    `${panelLargeWidth / 3}vw`,
  ].join(', ');
  return (
    <div className={classes}>
      <div className={css.listingCards}>
        <span className={css.resultCount}>
          {totalItems} result{totalItems > 1 ? 's' : ''}
        </span>
        {listings.map(l =>
          l.attributes?.publicData?.isProviderType ? (
            <UserResultCard listing={l} history={history} key={l.id.uuid} />
          ) : (
            <ListingResultCard listing={l} history={history} key={l.id.uuid} />
          )
        )}
        {
          // <ListingCard
          //   className={css.listingCard}
          //   key={l.id.uuid}
          //   listing={l}
          //   renderSizes={cardRenderSizes}
          //   setActiveListing={setActiveListing}
          // />
        }
        {/* {props.children} */}
      </div>
      {paginationLinks}
    </div>
  );
};

SearchResultsPanel.defaultProps = {
  children: null,
  className: null,
  listings: [],
  pagination: null,
  rootClassName: null,
  search: null,
};

const { array, node, object, string } = PropTypes;

SearchResultsPanel.propTypes = {
  children: node,
  className: string,
  listings: array,
  pagination: propTypes.pagination,
  rootClassName: string,
  search: object,
};

export default SearchResultsPanel;
