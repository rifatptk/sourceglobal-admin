import { Routes, Route } from 'react-router-dom';
// import {
//   UserPlusIcon,
//   ArrowRightOnRectangleIcon,
// } from '@heroicons/react/24/solid';
// import { Navbar } from '@/widgets/layout';
import routes from '@/routes';

export function Auth() {
  // const navbarRoutes = [
  //   {
  //     name: "sign up",
  //     path: "/auth/sign-up",
  //     icon: UserPlusIcon,
  //   },
  //   {
  //     name: 'sign in',
  //     path: '/auth/sign-in',
  //     icon: ArrowRightOnRectangleIcon,
  //   },
  // ];

  return (
    <div className="relative min-h-screen w-full">
      {/* <div className="container relative z-40 mx-auto p-4">
        <Navbar routes={navbarRoutes} />
      </div> */}
      <Routes>
        {routes.map(
          ({ layout, pages }) =>
            layout === 'auth' &&
            pages.map(({ path, element }) => (
              <Route exact path={path} element={element} />
            ))
        )}
      </Routes>
    </div>
  );
}

Auth.displayName = '/src/layout/Auth.jsx';

export default Auth;
