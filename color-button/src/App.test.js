import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('button has correct initial color and change color when clicked', () => {
  render(<App/>)

  const colorButton = screen.getByRole('button', {name: /change to blue/i})

  expect(colorButton).toHaveStyle({backgroundColor: 'red'})

  fireEvent.click(colorButton)

  expect(colorButton).toHaveStyle({backgroundColor: 'blue'})

  expect(colorButton.textContent).toBe('Change to red')
});

test('initial conditions', () => {
  render(<App/>)

  const colorButton = screen.getByRole('button', {name: /change to blue/i})
  expect(colorButton).toBeEnabled()

  const checkbox = screen.getByRole('checkbox')
  expect(checkbox).not.toBeChecked()
})

test('Checkbox disables button on first click and enables on second click', () => {
  render(<App/>)
  const colorButton = screen.getByRole('button', {name: /change to blue/i})
  const checkbox = screen.getByRole('checkbox', {name: /disable button/i})

  fireEvent.click(checkbox)
  expect(colorButton).toBeDisabled()

  fireEvent.click(checkbox)
  expect(colorButton).toBeEnabled()
})