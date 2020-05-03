import React from 'react';
import ReactDOM from 'react-dom';
import {shallow} from 'enzyme';
import App from './App';

it('renders without crashing', () => {
  const app = shallow(<App></App>)
  expect(app.exists()).toBe(true);
});
