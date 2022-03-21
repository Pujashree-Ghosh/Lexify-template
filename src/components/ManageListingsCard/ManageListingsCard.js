import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { MdModeEditOutline } from 'react-icons/md';
import { IoMdClose } from 'react-icons/io';
import { withRouter } from 'react-router-dom';

import config from '../../config';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { propTypes, LISTING_STATE_DRAFT, LISTING_STATE_CLOSED } from '../../util/types';
import { ensureListing } from '../../util/data';
import { createResourceLocatorString } from '../../util/routes';
import { ensureUser } from '../../util/data';
import routeConfiguration from '../../routeConfiguration';
import { isScrollingDisabled } from '../../ducks/UI.duck';
import {
  InlineTextButton,
  Menu,
  MenuLabel,
  MenuContent,
  MenuItem,
  ManageListingCard,
  Page,
  PaginationLinks,
  UserNav,
  NamedLink,
  LayoutSingleColumn,
  LayoutWrapperTopbar,
  LayoutWrapperMain,
  LayoutWrapperFooter,
  Footer,
} from '..';
import MenuIcon from '../ManageListingCard/MenuIcon';
import Overlay from '../ManageListingCard/Overlay';
import { TopbarContainer } from '../../containers';
import { formatMoney } from '../../util/currency';
import {
  LISTING_PAGE_PENDING_APPROVAL_VARIANT,
  LISTING_PAGE_DRAFT_VARIANT,
  LISTING_PAGE_PARAM_TYPE_DRAFT,
  LISTING_PAGE_PARAM_TYPE_EDIT,
  createSlug,
} from '../../util/urlHelpers';
// import css from './../../containers/ManageListingsPage/M+-anageListingsPage.module.css';
import ReadmoreButton from '../../containers/ReadmoreButton/ReadmoreButton';

const MENU_CONTENT_OFFSET = -12;

function ManageListingsCard() {
  const {
    listing,
    ensureUser,
    createSlug,
    priceData,
    editListingButton,
    onCloseListing,
    onOpenListing,
  } = props;
  const { price, state } = listing.attributes;
  const isDraft = state === LISTING_STATE_DRAFT;
  const isClosed = state === LISTING_STATE_CLOSED;
  const editListingLinkType = isDraft
    ? LISTING_PAGE_PARAM_TYPE_DRAFT
    : LISTING_PAGE_PARAM_TYPE_EDIT;

  const { formattedPrice } = priceData(price, intl);
  const id = listing.id.uuid;
  const slug = createSlug(listing?.attributes?.title);
  let listingOpen = null;
  const ensuredUser = ensureUser(listing.author);

  return (
    <div className={css.horizontalcard} key={id}>
      {/* leftdiv */}
      <div className={css.lefthorizontal}>
        {isDraft ? (
          <div className={css.lefttitle}>{listing?.attributes?.title}</div>
        ) : (
          <NamedLink className={css.manageLink} name="ListingPage" params={{ id, slug }}>
            <div className={css.lefttitle}> {listing?.attributes?.title}</div>
          </NamedLink>
        )}

        <ReadmoreButton
          // className={css.description}
          description={listing?.attributes?.description}
        />
      </div>
      {/* rightdiv */}
      <div className={css.righthorizontal}>
        {/* rightlowerdiv */}

        <div>
          {isDraft ? (
            <span className={css.span}>UNPUBLISHED</span>
          ) : (
            <span className={css.span}> PUBLISHED</span>
          )}
        </div>
        <span className={css.price}> {formattedPrice} </span>
        <button className={css.editbutton} onClick={() => editListingButton()}>
          <MdModeEditOutline /> <FormattedMessage id="ManageListingCard.editListing" />
          {/* <NamedLink
              // className={css.manageLink}
              className={css.linkcolor}
              name="EditListingPage"
              params={{ id, slug, type: editListingLinkType, tab: 'description' }}
            >
              <MdModeEditOutline />{' '}
              <FormattedMessage id="ManageListingCard.editListing" />
            </NamedLink> */}
        </button>
      </div>
      {!isDraft ? (
        <Menu
          className={classNames(css.menu, css.togglemenu, {
            [css.cardIsOpen]: !isClosed,
          })}
          contentPlacementOffset={MENU_CONTENT_OFFSET}
          contentPosition="left"
          useArrow={false}
          onToggleActive={isOpen => {
            listingOpen = isOpen ? listing : null;
            console.log(listingOpen);
            this.onToggleMenu(listingOpen);
          }}
          // isMenuOpen={!!listingMenuOpen && listingMenuOpen.id.uuid === l.id.uuid}
          // onToggleMenu={listingOpen}
          isOpen={!!listingMenuOpen && listingMenuOpen.id.uuid === listing.id.uuid}
        >
          <MenuLabel className={css.menuLabel} isOpenClassName={css.listingMenuIsOpen}>
            <div className={css.iconWrapper}>
              <MenuIcon className={css.menuIcon} isActive={isMenuOpen} />
            </div>
          </MenuLabel>
          <MenuContent rootClassName={css.menuContent}>
            <MenuItem key="close-listing">
              <div className={css.inlinebutton}>
                <IoMdClose />
                <InlineTextButton
                  className={css.buttontext}
                  // rootClassName={menuItemClasses}
                  onClick={event => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (!actionsInProgressListingId) {
                      this.onToggleMenu(null);
                      onCloseListing(listing.id);
                    }
                  }}
                >
                  <FormattedMessage id="ManageListingCard.closeListing" />
                </InlineTextButton>
              </div>
            </MenuItem>
          </MenuContent>
        </Menu>
      ) : null}
      {isClosed ? (
        <Overlay
          message={intl.formatMessage(
            { id: 'ManageListingCard.closedListing' },
            { listingTitle: title }
          )}
        >
          <button
            className={css.openListingButton}
            disabled={!!actionsInProgressListingId}
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              if (!actionsInProgressListingId) {
                onOpenListing(listing.id);
              }
            }}
          >
            <FormattedMessage id="ManageListingCard.openListing" />
          </button>
        </Overlay>
      ) : null}
    </div>
  );
}

export default ManageListingsCard;
