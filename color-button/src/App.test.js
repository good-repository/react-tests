import { render, screen, fireEvent } from '@testing-library/react';
import App, { replaceCamelWithSpaces } from './App';

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

test('disable button is grey, enable has color', () => {
  render(<App/>)
  const colorButton = screen.getByRole('button', {name: /change to blue/i})
  const checkbox = screen.getByRole('checkbox', {name: /disable button/i})

  fireEvent.click(checkbox)
  expect(colorButton).toHaveStyle('background-color: gray')

  fireEvent.click(checkbox)
  expect(colorButton).toHaveStyle('background-color: red')
})

test('Clicked button has gray background when disabled and blue when enabled', () => {
  render(<App/>)
  const colorButton = screen.getByRole('button', {name: /change to blue/i})
  const checkbox = screen.getByRole('checkbox', {name: /disable button/i})

  fireEvent.click(colorButton)
  fireEvent.click(checkbox)
  expect(colorButton).toHaveStyle({backgroundColor: 'gray'})

  fireEvent.click(checkbox)
  expect(colorButton).toHaveStyle({backgroundColor: 'blue'})
})

describe('spaces before camel-case capital letters', () => {
  test('Works for no inner capital letters', () => {
    expect(replaceCamelWithSpaces('Red')).toBe('Red')
  })

  test('Works for one inner capital letter', () => {
    expect(replaceCamelWithSpaces('MidnightBlue')).toBe('Midnight Blue')
  })

  test('Works for multiple inner capital letter', () => {
    expect(replaceCamelWithSpaces('MediumVioletRed')).toBe('Medium Violet Red')
  })
})