import Handsontable from 'handsontable';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';

import './FranceSvg';
import FranceSvg, { Point } from './FranceSvg';
import franceSVGText from 'bundle-text:../img/france.svg';


document.addEventListener('DOMContentLoaded', () => {

	const map = document.querySelector<FranceSvg>('france-svg')!
	const container = document.querySelector('#grid')!
	const svgFileInput = document.querySelector<HTMLInputElement>('#svg-file-input')!
	const radiusInput = document.querySelector<HTMLInputElement>('#radius-input')!

	map.svgElementStr = franceSVGText;

	const hot = new Handsontable(container, {
		data: [
		],
		colHeaders: ['Label', 'Catégorie', 'Latitude', 'Longitude', 'Couleur'],
		columns: [
			{ data: 'label' },
			{ data: 'category' },
			{ data: 'latitude', type: 'numeric' },
			{ data: 'longitude', type: 'numeric' },
			{ data: 'color' }
		],

		allowInsertRow: true,
		allowRemoveRow: true,
		contextMenu: true,
		rowHeaders: true,
		minRows:100,
		height: '100%',
		width: '100%',
		autoColumnSize: true,
		manualColumnResize: true,
		stretchH: 'all',
		autoWrapRow: true,
		autoWrapCol: true,
		licenseKey: 'non-commercial-and-evaluation'
	});

	// Fonction pour récupérer les données sous forme de tableau d'objets
	function getTableDataAsObjects() {
		const data: string[][] = hot.getData(); // Récupère les données brutes
		return (data.map(row => {

			return row.reduce((obj, colData, index) => {
				const column = hot.getColumnMeta(index);

				obj[String(column.data)] = colData;
				return obj;
			}, {} as Record<string, unknown>);
		}) as Point[]).filter(p=>p.latitude && p.longitude)
	}


	svgFileInput.addEventListener('input', () => {

		const file = svgFileInput.files?.[0];
		if (file) {

			if (file.type !== 'image/svg+xml') {
				alert('Le fichier n\'est pas un SVG');
			} else {

				const reader = new FileReader();
				reader.readAsText(file);
				reader.addEventListener('load', () => {

					map.svgElementStr = String(reader.result);
				})
			}
		}
	})

	radiusInput.addEventListener('input', () => {
		map.radius = radiusInput.valueAsNumber || 10;
	});


	hot.addHook('afterChange', () => {
		map.points = getTableDataAsObjects();
	})
	map.points = getTableDataAsObjects();

});


