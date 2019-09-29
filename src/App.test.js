import React from 'react';
import { shallow } from 'enzyme';
import App from './App';

it('renders welcome message', () => {
  const wrapper = shallow(<App />);
  const localText = <h1>Local Backup</h1>;
  expect(wrapper.contains(localText)).toBeTruthy();
});