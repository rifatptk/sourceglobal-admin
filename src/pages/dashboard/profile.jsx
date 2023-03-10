import {
  Card,
  CardBody,
  Typography,
  Switch,
  Tooltip,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Checkbox,
} from '@material-tailwind/react';
import { PencilSquareIcon } from '@heroicons/react/24/solid';
import { ProfileInfoCard, MessageCard } from '@/widgets/cards';
import RiMap from '@/components/RiMap';
import { useState } from 'react';
import { BASE_URL } from '@/apiConfigs';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import HashLoader from 'react-spinners/HashLoader';
import { toast } from 'react-toastify';
import { nationalities } from '@/constants';

export function Profile() {
  const token = localStorage.getItem('token');

  const { userId } = useParams();

  const {
    isLoading,
    error,
    data: user,
    refetch,
  } = useQuery(
    ['user', userId],
    () =>
      fetch(`${BASE_URL}/api/admin/singleUser/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.profile) setProfileInfo(data.profile);
          setsettings({
            active: data.user.active,
            roles: data.user.roles,
            geoFenceAlert: data.user.geoFenceAlert,
          });
          return data;
        }),
    { refetchOnWindowFocus: false }
  );

  const [isLoader, setIsLoader] = useState(false);
  //edit profile info=========
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(!open);

  const [dp, setdp] = useState(null);

  const [profileInfo, setProfileInfo] = useState({
    avatar: '',
    address: '',
    firstName: '',
    middleName: '',
    nationality: '',
    nationalId: '',
    passportId: '',
    phone: '',
    surName: '',
    title: '',
  });

  function onProfileInfoChangeHandler(e) {
    const { name, value } = e.target;
    setProfileInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function updateProfileInfo(e) {
    e.preventDefault();
    setIsLoader(true);

    const formData = new FormData();
    Object.entries(profileInfo).forEach((entry) => {
      if (entry[1]) formData.append(entry[0], entry[1]);
    });
    if (dp) formData.append('avatar', dp);

    fetch(`${BASE_URL}/api/admin/update/profile/${userId}`, {
      method: 'PATCH',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          refetch({ force: true });
          toast.success('Updated profile info successfully!');
          setdp(null);
          handleOpen();
        } else {
          handleOpen();
          console.log(data);
          toast.error('Failed to update profile info!');
        }
        setIsLoader(false);
      });
  }
  //edit profile info---------

  // settings ==========
  const [settings, setsettings] = useState({
    active: false,
    geoFenceAlert: false,
    roles: ['USER'],
  });

  function settingsChangeHandler(e) {
    const { name, checked } = e.target;
    setsettings((prev) => ({
      ...prev,
      [name]: checked,
    }));
  }

  function permissionChangeHandler(e) {
    e.target.checked
      ? setsettings({ ...settings, roles: [...settings.roles, e.target.value] })
      : setsettings({
          ...settings,
          roles: settings.roles.filter((p) => p !== e.target.value),
        });
  }
  const updateSettings = (e) => {
    e.preventDefault();
    setIsLoader(true);

    fetch(`${BASE_URL}/api/admin/update/settings/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(settings),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          refetch({ force: true });
          toast.success('Updated settings successfully!');
        } else {
          console.log(data);
          toast.error('Failed to update settings!');
        }
        setIsLoader(false);
      });
  };
  //settings----------------

  //delete user=============
  const [deletePromptOpened, setdeletePromptOpened] = useState(false);
  const handleOpenDeletePrompt = () => {
    setdeletePromptOpened(!deletePromptOpened);
  };
  const navigate = useNavigate();
  function deleteUser() {
    setIsLoader(true);

    fetch(`${BASE_URL}/api/admin/delete/user/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.success) {
          toast.success('Deleted User successfully!');
          navigate('/dashboard/users');
        } else {
          handleOpenDeletePrompt();
          console.log(response);
          toast.error(response.msg);
        }
        setIsLoader(false);
      });
  }

  return (
    <>
      <Card className="border my-5 lg:mx-4">
        <CardBody className="p-5 md:p-10">
          {user && (
            <>
              <div className="mb-10 ">
                <div className="flex items-center gap-6">
                  {profileInfo.avatar ? (
                    <img
                      src={profileInfo.avatar}
                      alt=""
                      className="w-20 h-20 shadow-lg rounded-full object-cover"
                    />
                  ) : (
                    <div className="uppercase w-20 h-20 text-4xl text-white grid place-items-center font-bold shadow-lg rounded-full bg-blue-400">
                      {user?.profile?.firstName[0] || 'Q'}
                    </div>
                  )}

                  <div>
                    <Typography variant="h5" color="blue-gray" className="mb-1">
                      {`${user?.profile?.firstName || 'No Name'} ${
                        user?.profile?.middleName || ''
                      } ${user?.profile?.surName || ''}`}
                    </Typography>
                    <Typography
                      variant="small"
                      className="font-normal text-blue-gray-600"
                    >
                      {user?.user.roles.join(' | ')}
                    </Typography>
                  </div>
                </div>
              </div>
              <div className="gird-cols-1 mb-12 grid gap-12 lg:grid-cols-2">
                {/* profile info */}
                <div>
                  <ProfileInfoCard
                    title="Profile Information"
                    details={{
                      name: `${user?.profile?.firstName || 'No Name'} ${
                        user?.profile?.middleName || ''
                      } ${user?.profile?.surName || ''}`,
                      title: user?.profile?.title || 'Not Set',
                      geoFenceStatus: user?.user.geofence,
                      phone: user?.profile?.phone || 'Empty',
                      email: user?.user.email,
                      Nationality: user?.profile?.nationality || 'Empty',
                      NID: user?.profile?.nationalId || 'Empty',
                      Passport: user?.profile?.passportId || 'Empty',
                      DeviceId: user.user.deviceId || 'Empty',
                    }}
                    action={
                      <Button
                        variant="text"
                        size="sm"
                        className="rounded"
                        onClick={handleOpen}
                      >
                        <Tooltip content="Edit Profile">
                          <div className="flex items-end gap-2">
                            <span>Edit</span>
                            <PencilSquareIcon className="h-5 w-5" />
                          </div>
                        </Tooltip>
                      </Button>
                    }
                  />
                  <Typography variant="h6" color="blue-gray" className="mt-10">
                    Emergency Contact
                  </Typography>
                  <ul className="flex flex-col gap-6">
                    <MessageCard
                      token={token}
                      refetch={refetch}
                      emergency={user.emergency}
                      userId={userId}
                      setIsLoader={setIsLoader}
                    />
                  </ul>
                </div>

                {/*  Settings */}
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-3">
                    Settings
                  </Typography>

                  <form
                    onSubmit={updateSettings}
                    className="space-y-5 bg-gray-100 rounded-lg border shadow-inner p-3 md:p-5 "
                  >
                    <div className="flex flex-col gap-3">
                      <h5>Status</h5>
                      <Switch
                        id="isActive"
                        name="active"
                        label={settings.active ? 'Active' : 'Inactive'}
                        checked={settings.active}
                        onChange={settingsChangeHandler}
                      />
                      <Switch
                        id="getAlert"
                        name="geoFenceAlert"
                        label="Get Geofence Alert"
                        checked={settings.geoFenceAlert}
                        onChange={settingsChangeHandler}
                      />
                    </div>
                    <div>
                      <h5>Tick Desired Permisions</h5>
                      <fieldset className="flex flex-col">
                        <Checkbox
                          label="ADMIN"
                          id="admin"
                          value="ADMINISTRATOR"
                          checked={settings.roles.includes('ADMINISTRATOR')}
                          onChange={permissionChangeHandler}
                        />
                        <Checkbox
                          label="MANAGER"
                          id="manager"
                          value="MANAGER"
                          checked={settings.roles.includes('MANAGER')}
                          onChange={permissionChangeHandler}
                        />
                        <Checkbox
                          label="USER"
                          id="user"
                          value="USER"
                          checked={settings.roles.includes('USER')}
                          onChange={permissionChangeHandler}
                        />
                      </fieldset>
                    </div>

                    <Button type="submit" className="w-fit">
                      Update
                    </Button>
                  </form>
                  <Button
                    onClick={handleOpenDeletePrompt}
                    color="red"
                    className="mt-10 w-full"
                  >
                    Delete User
                  </Button>
                </div>
              </div>

              {/* geofence */}
              <div className="pb-4">
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Geofence
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-500"
                >
                  Location & Geofence
                </Typography>
                <div className="mt-6">
                  <RiMap
                    geofence={
                      user.location || {
                        lat: 26.0289243,
                        long: 88.4682187,
                        radius: 200,
                      }
                    }
                    refetch={refetch}
                    userId={userId}
                    token={token}
                    setIsLoader={setIsLoader}
                  />
                </div>
              </div>
            </>
          )}
          {isLoading && (
            <div className="w-fit mx-auto py-5">
              <HashLoader color="#36d7b7" />
            </div>
          )}
          {error && (
            <div className="w-fit mx-auto py-5 font-bold text-red-500">
              &#9888; Error Fetching Data!
            </div>
          )}
        </CardBody>
      </Card>

      {/* edit profile info modal */}
      <Dialog
        size="xl"
        open={open}
        handler={handleOpen}
        className="overflow-visible"
      >
        <DialogHeader className="text-base md:text-xl">
          Edit User Profile.
        </DialogHeader>
        <form onSubmit={updateProfileInfo}>
          <DialogBody divider className="grid md:grid-cols-2 gap-2 md:gap-4">
            <label
              htmlFor="picture"
              className="md:col-span-2 cursor-pointer w-fit mx-auto"
              title="Click to change."
            >
              <img
                src={
                  dp
                    ? URL.createObjectURL(dp)
                    : profileInfo.avatar || '/img/add-avatar.png'
                }
                alt="profile-pic"
                className="w-[160px] h-[160px] rounded-full object-cover ring-4"
              />

              <p className="text-center mt-3 rounded-lg border text-gray-600 py-1">
                Profile picture
              </p>
            </label>
            <input
              name="picture"
              type="file"
              accept="image/*"
              className="hidden"
              id="picture"
              onChange={(e) => setdp(e.target.files[0])}
            />
            <Input
              required
              label="First Name"
              name="firstName"
              size="md"
              value={profileInfo.firstName}
              onChange={onProfileInfoChangeHandler}
            />
            <Input
              required
              label="Middle Name"
              name="middleName"
              size="md"
              value={profileInfo.middleName}
              onChange={onProfileInfoChangeHandler}
            />
            <Input
              required
              label="Sur Name"
              name="surName"
              size="md"
              value={profileInfo.surName}
              onChange={onProfileInfoChangeHandler}
            />
            <Input
              required
              label="Title"
              name="title"
              size="md"
              value={profileInfo.title}
              onChange={onProfileInfoChangeHandler}
            />

            <Input
              required
              label="Phone"
              name="phone"
              size="md"
              value={profileInfo.phone}
              onChange={onProfileInfoChangeHandler}
            />
            <Input
              required
              label="Address"
              name="address"
              size="md"
              value={profileInfo.address}
              onChange={onProfileInfoChangeHandler}
            />
            <select
              name="nationality"
              value={profileInfo.nationality}
              onChange={onProfileInfoChangeHandler}
              className="outline-none border border-gray-400 rounded-lg px-3 py-[10px]"
            >
              <option hidden>Select nationality</option>
              <option value="Indian">Indian</option>
              <option value="Pakistani">Pakistani</option>
              <option value="Bangladeshi">Bangladeshi</option>
              <option disabled className="font-bold">
                All
              </option>
              {nationalities.map((el, i) => (
                <option key={i} value={el}>
                  {el}
                </option>
              ))}
            </select>
            <Input
              required
              label="NID"
              name="nationalId"
              size="md"
              value={profileInfo.nationalId}
              onChange={onProfileInfoChangeHandler}
            />
            <Input
              required
              label="Passport No."
              name="passportId"
              size="md"
              value={profileInfo.passportId}
              onChange={onProfileInfoChangeHandler}
            />
          </DialogBody>
          <DialogFooter className="py-2">
            <Button
              variant="text"
              color="red"
              onClick={() => {
                handleOpen();
                setdp(null);
              }}
              className="mr-1"
            >
              <span>Cancel</span>
            </Button>
            <Button variant="gradient" color="green" type="submit">
              <span>Confirm</span>
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
      {/* delete user prompt modal */}
      <Dialog
        size="xl"
        open={deletePromptOpened}
        handler={handleOpenDeletePrompt}
      >
        <DialogHeader className="text-base md:text-xl">
          Delete User
        </DialogHeader>
        <DialogBody divider className="flex flex-col text-center ">
          <h3 className="text-lg font-bold mb-3 ">
            Are you sure want to delete this user?
          </h3>

          <p>
            This action will remove all of the informations about this user from
            the database.
          </p>
          <p>You will not be able to retreive them again.</p>
          <p>This operation cannot be undone.</p>
        </DialogBody>
        <DialogFooter className="py-2">
          <Button
            variant="text"
            onClick={handleOpenDeletePrompt}
            className="mr-1"
          >
            <span>Cancel</span>
          </Button>
          <Button variant="gradient" color="red" onClick={deleteUser}>
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>
      {isLoader && (
        <div className="fixed inset-0 grid place-items-center bg-black/80 z-[10000] backdrop-blur-[2px]">
          <HashLoader color="#36d7b7" />
        </div>
      )}
    </>
  );
}

export default Profile;
