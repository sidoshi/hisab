import { FC } from "react";
import { Button, View } from "reshaped";
import { ArrowLeft } from "react-feather";
import { useRouter } from "@tanstack/react-router";

interface NavigationProps {
  fallbackTo?: string;
  variant?: "ghost" | "outline" | "solid" | "faded";
  size?: "small" | "medium" | "large";
}

export const Navigation: FC<NavigationProps> = ({
  fallbackTo = "/",
  variant = "ghost",
  size = "small",
}) => {
  const router = useRouter();

  const handleBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to specific route if no history
      router.navigate({ to: fallbackTo });
    }
  };

  const handleForward = () => {
    window.history.forward();
  };

  return (
    <View justify="center" direction="row">
      <Button
        onClick={handleBack}
        variant={variant}
        size={size}
        icon={<ArrowLeft />}
      ></Button>

      <Button
        onClick={handleForward}
        variant={variant}
        size={size}
        icon={<ArrowLeft style={{ transform: "rotate(180deg)" }} />}
      ></Button>
    </View>
  );
};
