import Handsontable from 'handsontable';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';

import './FranceSvg';
import FranceSvg, { Point } from './FranceSvg';
import franceSVGText from 'bundle-text:../img/france.svg';

type LocalStorageItem = {
	file: string
	radius: string
	pointCss: string
}

// Fonction pour récupérer les données sous forme de tableau d'objets
function getTableDataAsObjects(hot: Handsontable) {
	const data: string[][] = hot.getData(); // Récupère les données brutes
	return (data.map(row => {

		return row.reduce((obj, colData, index) => {
			const column = hot.getColumnMeta(index);

			obj[String(column.data)] = colData;
			return obj;
		}, {} as Record<string, unknown>);
	}) as Point[])
}

document.addEventListener('DOMContentLoaded', () => {

	const map = document.querySelector<FranceSvg>('france-svg')!
	const container = document.querySelector('#grid')!
	const form = document.querySelector<HTMLFormElement>('#config-form')!;
	let hot: Handsontable | null = null;

	function processLocalStorage() {
		const data = JSON.parse(localStorage.getItem('form-value') ?? '[]') as LocalStorageItem
		for (let key in data) {
			const input = form.elements.namedItem(key);
			if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
				if (input.type !== 'file') {
					input.value = Reflect.get(data, key);
				}
			}
		}
		map.svgElementStr = data.file || franceSVGText;
		map.radius = Number(data.radius ?? '10')
		map.pointCss = data.pointCss

		const points = (JSON.parse(localStorage.getItem('map-points') ?? '[]') as Point[])
		map.points = points.filter(p => p.latitude && p.longitude)
		hot?.updateData(structuredClone(points));

	}

	form.addEventListener('input', async () => {
		const formData = new FormData(form);
		const entries = Array.from(formData.entries());

		const data = await Promise.all(entries.map(([k, v]) => {
			if (v instanceof File) {
				return new Promise((resolve) => {
					const reader = new FileReader();
					reader.readAsText(v);
					reader.addEventListener('load', () => {
						resolve([k, reader.result]);
					})
				})
			} else {
				return ([k, v])
			}
		})) as [string, string][]

		localStorage.setItem('form-value', JSON.stringify(Object.fromEntries(data)));
		processLocalStorage();
	});



	hot = new Handsontable(container, {
		data: [],
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
		minRows: 100,
		height: '100%',
		width: '100%',
		autoColumnSize: true,
		manualColumnResize: true,
		stretchH: 'all',
		autoWrapRow: true,
		autoWrapCol: true,
		licenseKey: 'non-commercial-and-evaluation'
	});


	hot.addHook('afterChange', (changes) => {
		if (changes !== null) {
			const points = getTableDataAsObjects(hot)
			localStorage.setItem('map-points', JSON.stringify(points));
			processLocalStorage();
		}
	})



	processLocalStorage();



});


