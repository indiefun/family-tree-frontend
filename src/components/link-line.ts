import { PolylineEdge, PolylineEdgeModel } from "@logicflow/core";

type PolyPoint = {
    x: number;
    y: number;
    id?: string;
};

const filterRepeatPoints = (points: PolyPoint[]): PolyPoint[] => {
    const result: PolyPoint[] = [];
    const pointsMap: Record<string, PolyPoint> = {};
    points.forEach(p => {
        const id = `${p.x}-${p.y}`;
        p.id = id;
        pointsMap[id] = p;
    });
    Object.keys(pointsMap).forEach(p => {
        result.push(pointsMap[p]);
    });
    return result;
};
const getSimplePolyline = (sPoint: PolyPoint, tPoint: PolyPoint): PolyPoint[] => {
    const points = [
        sPoint,
        { x: sPoint.x, y: (sPoint.y + tPoint.y) * 0.5 },
        { x: tPoint.x, y: (sPoint.y + tPoint.y) * 0.5 },
        tPoint,
    ];
    return filterRepeatPoints(points);
};

class LinkLineView extends PolylineEdge {
}

class LinkLineModel extends PolylineEdgeModel {
    updatePoints() {
        const pointsList = getSimplePolyline(
            { x: this.startPoint.x, y: this.startPoint.y },
            { x: this.endPoint.x, y: this.endPoint.y },
        );
        this.pointsList = pointsList;
        this.points = pointsList.map(point => `${point.x},${point.y}`).join(' ');
    }
    getArrowStyle() {
        const style = super.getArrowStyle();
        style.verticalLength = 0
        return style;
    }
    getEdgeStyle() {
        const style = super.getEdgeStyle();
        style.stroke = "black";
        return style;
    }
    getOutlineStyle() {
        const style = super.getOutlineStyle();
        const { isSelected } = this
        style.stroke = isSelected ? "blue" : "none"
        if (style.hover) {
            style.hover.stroke = "blue"
        }
        return style;
    }
}

export default {
    type: "link-line",
    view: LinkLineView,
    model: LinkLineModel,
};
