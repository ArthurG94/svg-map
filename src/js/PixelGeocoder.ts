import proj4 from 'proj4';

interface Boundaries {
	xmin: number;
	xmax: number;
	ymin: number;
	ymax: number;
}

interface BoundariesLatLng {
	latMin: number;
	latMax: number;
	lngMin: number;
	lngMax: number;
}

class PixelGeocoder {

	public srcBoundaries: BoundariesLatLng = { latMin: 0, latMax: 0, lngMin: 0, lngMax: 0 };
	public imageBoundaries: Boundaries = { xmin: 0, xmax: 0, ymin: 0, ymax: 0 };

	public calculateCoordinatesToPixel(lat: number, lng: number): {x:number, y:number} {
		const [lng1, lat1] = proj4('EPSG:4326', 'EPSG:3857', [lng, lat]);
		const [lngMin, latMin] = proj4('EPSG:4326', 'EPSG:3857', [this.srcBoundaries.lngMin, this.srcBoundaries.latMin]);
		const [lngMax, latMax] = proj4('EPSG:4326', 'EPSG:3857', [this.srcBoundaries.lngMax, this.srcBoundaries.latMax]);
		
		// Calcul de X et Y en pixels en normalisant par rapport à l'image
		const x = ((lng1 - lngMin) / (lngMax - lngMin)) * (this.imageBoundaries.xmax - this.imageBoundaries.xmin) + this.imageBoundaries.xmin;
		const y = this.imageBoundaries.ymax - (((lat1 - latMin) / (latMax - latMin)) * (this.imageBoundaries.ymax - this.imageBoundaries.ymin));

		return {x, y};
	}
}


export default PixelGeocoder;