import React, { useState, useEffect } from 'react';
import { apiBaseUrl } from '../../util/api';
import VerificationCard from '../VerificatoinCard/VerificationCard';
import axios from 'axios';
import moment from 'moment';
import IconSpinner from '../IconSpinner/IconSpinner';
import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';

function VerificationTab(props) {
  const { currentUser } = props;
  const [verificationList, setVerificationList] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  useEffect(() => {
    let isCancelled = false;
    async function fetchData(id) {
      const response = await axios.post(`${apiBaseUrl()}/api/fetchVerificationList`, {
        providerId: id,
        start: moment()
          .startOf('day')
          .toISOString(),
        end: moment()
          .clone()
          .add(1, 'w')
          .toISOString(),
      });
      // console.log(response);
      if (!isCancelled) {
        setDataLoaded(true);
        setVerificationList(
          response.data.map(({ _id, customerId, start, end, hasVerified, meetingLink }) => {
            return {
              _id,
              customerId,
              start,
              end,
              hasVerified,
              meetingLink,
            };
          })
        );
      }
    }
    currentUser && currentUser.id && currentUser.id.uuid && fetchData(currentUser.id.uuid);

    return () => {
      isCancelled = true;
    };
  }, [currentUser]);
  const noResults =
    dataLoaded && verificationList.length === 0 ? (
      <FormattedMessage id={'VerificationTab.noResultFound'} />
    ) : null;

  return (
    <div>
      {!dataLoaded && <IconSpinner />}

      {verificationList &&
        verificationList?.map(m => {
          return <VerificationCard detail={m} key={m._id} />;
        })}
      {noResults}
    </div>
  );
}

export default VerificationTab;
