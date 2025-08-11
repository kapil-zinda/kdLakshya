'use client';

import React, { useEffect, useState } from 'react';

import { getItemWithTTL } from '@/utils/customLocalStorageWithTTL';
import styled from '@emotion/styled';
import { Button } from '@mui/material';
import axios from 'axios';
import { PenIcon, User2Icon } from 'lucide-react';

import { EditOrganisationDetails } from '../modal/EditOrganisationDetails';

const BaseURLAuth = process.env.NEXT_PUBLIC_BaseURLAuth || '';
type OverviewProps = {
  orgId: string;
  privillege: string;
};
const Card = styled.div`
  background: '#d3ebffcc';
  position: relative;
  cursor: pointer;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  width: 100%;
  padding: 0.8rem 1rem;
  margin-top: 2rem;
  border-radius: 0.5rem;
  box-shadow:
    rgb(23 93 207 / 20%) 0px 2px 8px 0px,
    0px 0px 2px #1949a1;
  border: 1px solid rgb(66, 133, 244);
  transition: 250ms;

  @media (max-width: 768px) {
    padding: 0.6rem 0.5rem;
  }
`;

const FlexContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const UserCard = styled.div`
  display: flex;
  width: 100%;
  max-width: 300px;
  height: 100px;
  justify-content: center;
  align-items: center;
  margin: 5px auto;

  @media (min-width: 768px) {
    width: 48%;
  }

  @media (min-width: 1024px) {
    width: 32%;
  }
`;

const UserAvatar = styled.div`
  margin: 0 10px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: orange;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
`;

const UserInfo = styled.div`
  margin-left: 5px;
  width: 225px;
  font-size: 14px;
`;

interface Permission {
  [key: string]: string;
}

interface OverviewData {
  name?: string;
  address?: string;
  description?: string;
  created_ts?: number;
  modified_ts?: number;
  id?: string;
  is_active?: boolean;
  key_id?: string;
  org?: string;
  owner?: string[];
  permission?: Permission;
}

interface UserListProps {
  permission: Permission;
}

export const UserList: React.FC<UserListProps> = ({ permission }) => {
  return (
    <FlexContainer>
      {Object.entries(permission).map(([email, role], index) => {
        return (
          <UserCard key={index}>
            <UserAvatar>
              <User2Icon style={{ height: '30px', width: '30px' }} />
            </UserAvatar>
            <UserInfo>
              <div>{role}</div> {/* Displaying the role (value) */}
              <div style={{ fontSize: '12px' }}>{email}</div>{' '}
              {/* Displaying the email (key) */}
            </UserInfo>
          </UserCard>
        );
      })}
    </FlexContainer>
  );
};

const Overview: React.FC<OverviewProps> = ({ orgId, privillege }) => {
  const [showModal, setShowModal] = useState(false);
  const [overviewData, setOverviewData] = useState<OverviewData>({});
  // const bearerData = localStorage.getItem('bearerToken');
  // let jsonBearer: { value?: string } | null = null;
  // let bearerToken = null

  // if (bearerData) {
  //   try {
  //     jsonBearer = JSON.parse(bearerData);
  //     bearerToken = jsonBearer?.value || 'rohan';
  //   } catch (error) {
  //     console.error('Error parsing JSON:', error);
  //   }
  // }
  const bearerToken = getItemWithTTL('bearerToken');
  const onClose = () => {
    setShowModal(false);
  };
  const handleClicked = function () {
    setShowModal(true);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${BaseURLAuth}/organizations/${orgId}`, {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/vnd.api+json',
          },
        });
        setOverviewData(res.data.data.attributes);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [orgId]);

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0 1rem',
        }}
      >
        <h1
          style={{
            fontSize: '22px',
            textAlign: 'center',
            marginBottom: '1rem',
          }}
        >
          Organisation Management Dashboard
        </h1>
        {privillege == 'head' && (
          <Button
            variant="outlined"
            style={{ marginBottom: '1rem' }}
            onClick={handleClicked}
          >
            <PenIcon style={{ marginRight: '8px', width: '15px' }} /> Edit
            Details
          </Button>
        )}
      </div>
      {overviewData.name ? (
        <Card>
          <h2
            style={{ margin: '10px 5px', fontSize: '20px', fontWeight: '500' }}
          >
            Organisation Details
          </h2>
          <hr style={{ margin: '10px 0' }} />
          <div style={{ fontSize: '18px', margin: '24px 1rem' }}>
            <h3>Organisation Name</h3>
            <p
              style={{ fontSize: '14px', margin: '5px 0rem', color: '#696969' }}
            >
              {overviewData?.name}
            </p>
          </div>
          <div style={{ fontSize: '18px', margin: '5px 1rem' }}>
            Description
          </div>
          <p style={{ fontSize: '14px', margin: '5px 1rem', color: '#696969' }}>
            {overviewData?.description}
          </p>
          <hr style={{ margin: '10px 0' }} />
          <div style={{ fontSize: '18px', margin: '5px 1rem' }}>
            Organisation Owner
          </div>
          <UserCard>
            <UserAvatar>
              <User2Icon style={{ height: '30px', width: '30px' }} />
            </UserAvatar>
            <UserInfo>
              <div>{overviewData?.owner?.[0]}</div>
              <div style={{ fontSize: '12px' }}>{overviewData?.owner?.[1]}</div>
            </UserInfo>
          </UserCard>
          <div style={{ fontSize: '18px', margin: '5px 1rem' }}>
            Organisation Admins
          </div>
          {overviewData?.permission && (
            <UserList permission={overviewData.permission} />
          )}
        </Card>
      ) : (
        <div>Loading...</div>
      )}
      {showModal && (
        <EditOrganisationDetails
          onCloses={onClose}
          data={overviewData}
          orgId={orgId}
          setData={setOverviewData}
        />
      )}
    </>
  );
};

export default Overview;
