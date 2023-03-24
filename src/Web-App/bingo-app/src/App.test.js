import { render, screen, act } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders App component', () => {
    act (() => {
    render(<App />);
    });

    Logger.info("message from test")

    screen.debug();
  });
});
