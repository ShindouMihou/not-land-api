declare module '@geo-maps/earth-seas-1m' {
    const getMap: () => any;
    export default getMap;
}

declare module 'geojson-geometries-lookup' {
    class GeoJsonLookup {
        constructor(geojson: any);
        hasContainers(point: { type: string; coordinates: number[] }): boolean;
    }
    export default GeoJsonLookup;
}