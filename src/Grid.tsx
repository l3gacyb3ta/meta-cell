import { Accessor, createEffect, createSignal, Setter, Signal } from "solid-js";
import "./Grid.css";
import { createStore } from "solid-js/store";

const WIDTH = 20;
const HEIGHT = 20;

function shuffle<T>(array: T[]): T[] {
    const newArray = [...array]; // Create a copy of the array
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // Swap elements
    }
    return newArray;
  }

const clamp_xy = (x: number, y: number): [number, number] => [
  x > WIDTH ? WIDTH : x < 0 ? 0 : x,
  y > HEIGHT ? HEIGHT : y < 0 ? 0 : y,
];

const wrap_xy = (x: number, y: number): [number, number] => [
  x % WIDTH,
  y % HEIGHT,
];

const get_wrapped = (
  x: number,
  y: number,
  grid: GridType
): [Accessor<string>, Setter<string>] => {
  [x, y] = wrap_xy(x, y);
  const thing = () => grid[x][y][0]();
  return [thing, grid[x][y][1]];
};

const get_clamped = (
  x: number,
  y: number,
  grid: GridType
): [Accessor<string>, Setter<string>] => {
  if (x > WIDTH || x < 0) {
    return createSignal("nan");
  }
  if (y > HEIGHT || y < 0) {
    return createSignal("nan");
  }
  const thing = () => grid[x][y][0]();
  return [thing, grid[x][y][1]];
};

type GridType = [Accessor<string>, Setter<string>][][];

function Cell(props: {
  x: number;
  y: number;
  color: Accessor<string>;
  grid: GridType;
  rules: ((
    neighbours: [Accessor<string>, Setter<string>][][],
    grid: GridType
  ) => boolean)[];
}) {
  const { x, y, color, grid, rules } = props;
  const setter = grid[x][y][1];

  createEffect(() => {
    const top_left = get_clamped(x - 1, y + 1, grid);
    const top_up = get_clamped(x, y + 1, grid);
    const top_right = get_clamped(x + 1, y + 1, grid);

    const left = get_clamped(x - 1, y, grid);
    const middle = get_clamped(x, y, grid);
    const right = get_clamped(x + 1, y, grid);

    const bottom_left = get_clamped(x - 1, y - 1, grid);
    const bottom_down = get_clamped(x, y - 1, grid);
    const bottom_right = get_clamped(x + 1, y - 1, grid);

    const neighbours = [
      [top_left, top_up, top_right],
      [left, middle, right],
      [bottom_left, bottom_down, bottom_right],
    ];

    let shuffled_rules = shuffle(rules);

    shuffled_rules.forEach((rule) => {
      let result = rule(neighbours, grid);
      setter(result ? "on" : "off");
    });
  });

  return <div></div>;
}

const ifUpRule = (
  neighbours: [Accessor<string>, Setter<string>][][],
  grid: GridType
): boolean => {
  return neighbours[0][1][0]() == "on";
};

const fall_down_rule = (
  neighbours: [Accessor<string>, Setter<string>][][],
  grid: GridType
): boolean => {
  if (neighbours[2][1][0]() == "off" && neighbours[1][1][0]() == "on") {
    // neighbours[1][1][1]("off");
    neighbours[2][1][1]("on");
    return false;
  }
  return neighbours[1][1][0]() == "on";
};

const trueRule = (
  neighbours: [Accessor<string>, Setter<string>][][],
  grid: GridType
): boolean => {
  return true;
};

const fall_left_rule = (
  neighbours: [Accessor<string>, Setter<string>][][],
  grid: GridType
): boolean => {
  if (neighbours[2][0][0]() == "off" && neighbours[1][1][0]() == "on" && neighbours[2][1][0]() == "on") {
    neighbours[2][0][1]("on");
    return false;
  }
  return neighbours[1][1][0]() == "on";
};

const fall_right_rule = (
    neighbours: [Accessor<string>, Setter<string>][][],
    grid: GridType
  ): boolean => {
    if (neighbours[2][2][0]() == "off" && neighbours[1][1][0]() == "on" && neighbours[2][1][0]() == "on") {
      neighbours[2][2][1]("on");
      return false;
    }
    return neighbours[1][1][0]() == "on";
  };
  
const RulesTest = [fall_down_rule, fall_left_rule, fall_right_rule];

function Grid() {
  const [first, setFirst] = createSignal("hey");

  let grid: [Accessor<string>, Setter<string>][][] = [[[first, setFirst]]];

  for (let x = 0; x <= WIDTH; x++) {
    grid[x] = [];
    for (let y = 0; y <= HEIGHT; y++) {
      const [getter, setter] = createSignal("off");
      grid[x][y] = [getter, setter];
    }
  }

  let list: any[] = [];
  for (let y = HEIGHT; y >= 0; y--) {
    let row = [];
    for (let x = 0; x <= WIDTH; x++) {
      const onclick = () => {
        if (grid[x][y][0]() == "on") {
          grid[x][y][1]("off");
        } else {
          grid[x][y][1]("on");
        }
      };

      const color = () => (grid[x][y][0]() == "on" ? "black" : "");

      row.push(
        <td onmouseover={onclick} class={color()}>
          <Cell
            x={x}
            y={y}
            color={grid[x][y][0]}
            grid={grid}
            rules={RulesTest}
          />
        </td>
      );
    }
    list.push(<tr>{row}</tr>);
  }

  return (
    <div>
      <p>The Grid</p>
      <table class="grid">{list}</table>
    </div>
  );
}

export default Grid;
