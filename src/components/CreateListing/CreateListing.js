import React from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { pathByRouteName } from '../../util/routes';
import routeConfiguration from '../../routeConfiguration';
import { intlShape, injectIntl } from '../../util/reactIntl';
import { setListingCategory } from '../../ducks/user.duck';

function CreateListingPageComponent(props) {
  const { onSetListingCategory, history } = props;
  const routes = routeConfiguration();

  return (
    <div>
      <button
        onClick={() => {
          // onSetListingCategory('publicOral');
          history.push(pathByRouteName('NewListingPublicOralPage', routes, {}));
        }}
      >
        Public Oral
      </button>
      <button
        onClick={() => {
          // onSetListingCategory('customOral');
          history.push(pathByRouteName('NewListingCustomOralPage', routes, {}));
        }}
      >
        Custom Oral
      </button>
      <button
        onClick={() => {
          // onSetListingCategory('customService');
          history.push(pathByRouteName('NewListingCustomServicePage', routes, {}));
        }}
      >
        Custom Service
      </button>
      {/* <NamedLin */}
    </div>
  );
}
// const mapStateToProps = state => {
//   const { category } = state.user;
//   console.log(category);
//   return { category };
// };
// const mapDispatchToProps = dispatch => ({
//   onSetListingCategory: category => dispatch(setListingCategory(category)),
// });
const CreateListing = compose(
  withRouter
  // connect(mapStateToProps, mapDispatchToProps)
)(injectIntl(CreateListingPageComponent));

export default CreateListing;
