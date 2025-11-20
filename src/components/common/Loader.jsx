import { ScaleLoader } from "react-spinners";

const Loader = ({ loading = true, color = "#1976d2", height = 35, width = 4 }) => {
  if (!loading) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
      }}
    >
      <ScaleLoader color={color} height={height} width={width} radius={2} margin={2} />
    </div>
  );
};

export default Loader;
