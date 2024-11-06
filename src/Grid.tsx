import { Accessor, createEffect, createSignal, Setter, Signal } from 'solid-js'
import './Grid.css'
import { createStore } from 'solid-js/store';

function Cell(props: {x: number, y: number, color: Accessor<string>, grid: [Accessor<string>, Setter<string>][][]}) {
    const {x, y, color, grid} = props;

    createEffect(() => {
        
        let upper = y != 0 ? grid[x][y -1][0]() : "off";
        if (upper == "on") {
            grid[x][y][1]("on")
        }
    })

    return (
        <p>{color()}</p>
    )
}

type GridType = {
    [key: string]: string
};
function Grid() {
    const WIDTH = 10;
    const HEIGHT = 10;
    const [first, setFirst] = createSignal("hey");



    let grid: [Accessor<string>, Setter<string>][][] = [[[first, setFirst]]]

    for (let x = 0; x <= 10; x++) {
        grid[x] = [];
        for (let y = 0; y <= 10; y++) {
            const [getter, setter] = createSignal("off")
            grid[x][y] = [getter, setter];
        }
    }

    let list: any[] = [];
    for (let x = 0; x <= 10; x++) {
        let row = [];
        for (let y = 0; y <= 10; y++) {
            const onclick = () => {
                grid[x][y][1]("on");
            }
            row.push(<td onclick={onclick}><Cell x={x} y={y} color={grid[x][y][0]} grid={grid}/></td>);
        }
        list.push(
            <tr>
                {row}
            </tr>
        )
    }

    return (
        <div>
            <p>The Grid</p>
            <table class="grid">
            {
                list
            }
            </table>
        </div>
    )
}

export default Grid
