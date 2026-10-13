import React from "react";
import { act, fireEvent, render } from "@testing-library/react";
import App from "./App";

describe("Memory Game", () => {
  it("creates the correct number of tiles for the selected difficulty", () => {
    const { container, getByLabelText, getByText } = render(<App />);

    fireEvent.click(getByLabelText("Hard"));
    fireEvent.click(getByText("Start Game"));

    expect(container.querySelectorAll(".cells_container .cell")).toHaveLength(32);
  });

  it("counts each pair attempt once and hides unmatched tiles", () => {
    jest.useFakeTimers();
    const { container, getByText } = render(<App />);
    fireEvent.click(getByText("Start Game"));

    const tiles = Array.from(container.querySelectorAll(".cells_container .cell"));
    fireEvent.click(tiles[0]);
    fireEvent.click(tiles[0]);
    expect(getByText("Attempts: 0")).toBeTruthy();

    const firstValue = tiles[0].getAttribute("data-number");
    const matchingTile = tiles.find(
      (tile, index) => index !== 0 && tile.getAttribute("data-number") === firstValue
    );
    fireEvent.click(tiles[0]);
    fireEvent.click(matchingTile);
    expect(getByText("Attempts: 1")).toBeTruthy();
    expect(tiles[0].textContent).toBe(firstValue);
    expect(matchingTile.textContent).toBe(firstValue);

    const unmatchedTiles = tiles.filter(
      (tile) => tile.getAttribute("data-number") !== firstValue
    );
    fireEvent.click(unmatchedTiles[0]);
    const nonmatchingTile = unmatchedTiles.find(
      (tile) =>
        tile.getAttribute("data-number") !== unmatchedTiles[0].getAttribute("data-number")
    );
    fireEvent.click(nonmatchingTile);
    expect(getByText("Attempts: 2")).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(800);
    });
    expect(unmatchedTiles[0].textContent).toBe("?");
    expect(nonmatchingTile.textContent).toBe("?");
    jest.useRealTimers();
  });

  it("finishes after every pair has been matched", () => {
    const { container, getByRole, getByText } = render(<App />);
    fireEvent.click(getByText("Start Game"));

    const tiles = Array.from(container.querySelectorAll(".cells_container .cell"));
    const values = [...new Set(tiles.map((tile) => tile.getAttribute("data-number")))];
    values.forEach((value) => {
      const pair = tiles.filter((tile) => tile.getAttribute("data-number") === value);
      fireEvent.click(pair[0]);
      fireEvent.click(pair[1]);
    });

    expect(getByText("Attempts: 4")).toBeTruthy();
    expect(getByRole("status").textContent).toContain("All pairs matched");
  });
});
