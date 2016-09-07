/* @flow */
import React from 'react';
import { IndexRoute, Route } from 'react-router';

import App from './app/App';
import Fields from './fields/FieldsPage';
import Firebase from './firebase/FirebasePage';
import Home from './home/HomePage';
import Editor from './editor/EditorPage';
import Intl from './intl/IntlPage';
import Me from './me/MePage';
import NotFound from './notfound/NotFoundPage';
import Offline from './offline/OfflinePage';
import Profile from './me/ProfilePage';
import Settings from './me/SettingsPage';
import SignIn from './auth/SignInPage';
import Todos from './todos/TodosPage';

const createRoutes = (getState: Function) => {
  const requireViewer = (nextState, replace) => {
    if (getState().users.viewer) return;
    replace({
      pathname: '/signin',
      state: { nextPathname: nextState.location.pathname },
    });
  };

  return (
    <Route component={App} path="/">
      <IndexRoute component={Editor} />
      <Route component={Home} path="home" />
      <Route component={Fields} path="fields" />
      <Route component={Firebase} path="firebase" />
      <Route component={Intl} path="intl" />
      <Route component={Me} onEnter={requireViewer} path="me">
        <Route component={Profile} path="profile" />
        <Route component={Settings} path="settings" />
      </Route>
      <Route component={Offline} path="offline" />
      <Route component={SignIn} path="signin" />
      <Route component={Todos} path="todos" />
      <Route component={NotFound} path="*" />
    </Route>
  );
};

export default createRoutes;
