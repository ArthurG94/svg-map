import { LitElement, PropertyValues, html, unsafeCSS, } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import francePng from 'data-url:../img/france.png'


import PixelGeocoder from './PixelGeocoder';

export type Point = {
	label: string,
	category: string,
	latitude: number,
	longitude: number,
	color: string
}

@customElement('france-svg')
class FranceSvg extends LitElement {

	public static styles = [unsafeCSS(`
		:host{
			display: flex;
			align-items:center;
			justify-content:center;
		}
		.map{
			background: url(${francePng});
			background-size:100%;
			width:auto;
			height:auto;
		}
	`)]

	private _svgElement: SVGSVGElement | null = null;
	private geocoder: PixelGeocoder;

	@property()
	public accessor points: Point[] = [];

	@property()
	public accessor radius: number = 10;

	private circlesGroups: SVGGElement[];

	public constructor() {
		super();

		this.circlesGroups = []
		this.geocoder = new PixelGeocoder();

		this.geocoder.imageBoundaries = {
			xmax: 1163.000,
			xmin: 0,
			ymax: 1144.689,
			ymin: 0
		}

		this.geocoder.srcBoundaries = {
			latMin: 41.32975680365846,
			latMax: 51.07178552186052,
			lngMin: -4.822776278393206,
			lngMax: 9.532650054423131,
		}

	}

	public set svgElementStr(svg: string) {
		const div = document.createElement('div')
		div.innerHTML = svg;
		this._svgElement = div.querySelector('svg')!;
		let x = 0;
		let y = 0;
		let w = 0;
		let h = 0;

		if (this._svgElement.hasAttribute('viewBox')) {
			const viewBox = this._svgElement.getAttribute('viewBox') ?? '0 0 0 0';
			const parts = viewBox.split(' ')
			x = Number(parts[0]);
			y = Number(parts[1]);
			w = Number(parts[2]);
			h = Number(parts[3]);
		} else {
			w = Number(this._svgElement.getAttribute('width') ?? this._svgElement.style.width ?? '0')
			h = Number(this._svgElement.getAttribute('height') ?? this._svgElement.style.height ?? '0')
		}

		this.geocoder.imageBoundaries = {
			xmax: w,
			xmin: x,
			ymax: h,
			ymin: y
		}


		this.requestUpdate();
	}

	private svgToDataUrl(svgElement: SVGSVGElement) {
		const serializer = new XMLSerializer();
		let svgString = serializer.serializeToString(svgElement);

		let encodedData = encodeURIComponent(svgString).replace(/'/g, '%27').replace(/"/g, '%22');

		return `data:image/svg+xml;charset=utf-8,${encodedData}`;
	}

	public updated(_changedProperties: PropertyValues): void {
		super.update(_changedProperties);
		const containerRect = this.getBoundingClientRect();
		console.log(containerRect);

		const img = this.renderRoot.querySelector('img');
		if(img){
			img.style.setProperty('max-height', containerRect.height+'px')
			img.style.setProperty('max-width', containerRect.width+'px')
		}



	}

	public render() {
		if (this._svgElement) {
			this.circlesGroups.forEach(circle => circle.remove());

			const groupedPoints = new Map<string, Point[]>();

			this.points.forEach(point => {
				if (!groupedPoints.has(point.category)) {
					groupedPoints.set(point.category, []);
				}
				groupedPoints.get(point.category)!.push(point);
			});


			this.circlesGroups = Array.from(groupedPoints.entries()).map(([cat, points]) => {

				const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
				group.setAttribute('title', cat)
				group.append(...points.map(point => {

					const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
					const { x, y } = this.geocoder.calculateCoordinatesToPixel(point.latitude, point.longitude);

					circle.setAttribute('cx', String(x));
					circle.setAttribute('cy', String(y));
					circle.setAttribute('r', String(this.radius));
					circle.setAttribute('title', point.label ?? '')
					circle.style.setProperty('fill', point.color);
					return circle;

				}));
				return group;
			});
			this._svgElement.append(...this.circlesGroups)

		
			return html`<img class="map" src=${this.svgToDataUrl(this._svgElement)}>`
		} else {
			return '';
		}
	}

}

export default FranceSvg