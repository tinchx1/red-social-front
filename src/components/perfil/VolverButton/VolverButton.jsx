"use client"
import { Button } from "@/components";
import { useRouter } from "next/navigation";
import ChevronLeftIcon from "@/assets/chevron_left.svg";

const VolverButton = ({ className, style, variant }) => {
  const router = useRouter();

  const handleVolver = () => {
    router.back();
  };

  return (
    <div className={`${className || ''}`} style={{style, marginBottom: "6px"}}>
      <Button 
        variant={variant || "light-blue"} 
        onClick={handleVolver}
        icon={<ChevronLeftIcon />}
      >
        Volver
      </Button>
    </div>
  );
};

export default VolverButton;
