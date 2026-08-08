import { useFilterStore } from '@/store/filter-store';
import type { MapManifest } from '@/lib/maps/types';
import { FloorPlane } from './floor-plane';

interface FloorStackProps {
    map: MapManifest;
}

export function FloorStack({ map }: FloorStackProps) {
    const visibleFloors = useFilterStore((s) => s.visibleFloors);
    const showAllPlayersAndLabels = useFilterStore((s) => s.showAllPlayersAndLabels);

    return (
        <group>
            {map.floors.map((floor) => {
                const isFloorVisible = visibleFloors.has(floor.index);
                const shouldShowLabels = showAllPlayersAndLabels || isFloorVisible;

                return (
                    <FloorPlane
                        key={floor.index}
                        floor={floor}
                        width={map.footprint.width}
                        depth={map.footprint.depth}
                        divisions={map.gridDivisions}
                        walls={map.wallsByFloor[floor.index] || []}
                        roomLabels={map.roomLabelsByFloor[floor.index] || []}
                        isVisible={isFloorVisible}
                        showRoomLabels={shouldShowLabels}
                    />
                );
            })}
        </group>
    );
}
