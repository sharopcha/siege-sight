export function Lighting() {
    return (
        <>
            <ambientLight intensity={0.65} />
            <directionalLight position={[20, 40, 20]} intensity={1.2} />
            <directionalLight position={[-20, 20, -20]} intensity={0.4} color="#3b82f6" />
        </>
    );
}
