export function routeEdge(
    x1: number,
    y1: number,
    x2: number,
    y2: number
): string {
    const minExit = 20;
    
    // Target is to the right of source output port
    if (x2 >= x1 + minExit) {
        const midX = (x1 + x2) / 2;
        return `M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`;
    }
    
    // Target is to the left of source (backwards path)
    const exitX = x1 + minExit;
    const enterX = x2 - minExit;
    const midY = (y1 + y2) / 2;
    
    return `M ${x1} ${y1} H ${exitX} V ${midY} H ${enterX} V ${y2} H ${x2}`;
}
