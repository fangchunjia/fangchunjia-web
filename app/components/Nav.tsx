import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  type Transition,
} from "motion/react";
import AboutGraphic from "./graphics/AboutGraphic";
import HomeGraphic from "./graphics/HomeGraphic";
import ProjectsGraphic from "./graphics/ProjectsGraphic";
import { NavLink, useLocation } from "react-router";

export interface NavProps {
  items: NavItem[];
  pathname: string;
}

export interface NavItem {
  title: string;
  id: string;
  to: string;
}

const TRANSITION_SETTINGS: Transition = {
  type: "tween",
  duration: 0.4,
  ease: "linear",
};

interface CarouselItemProps {
  item: NavItem;
  index: number;
  x: any;
  transition: any;
  onClick: () => void;
  isCurrent: boolean;
  itemCount: number;
  relativeIndex: number;
}

// const baseW = 32;

function NavItem({
  item,
  index,
  transition,
  onClick,
  isCurrent,
  relativeIndex,
  itemCount,
}: CarouselItemProps) {
  // If relativeIndex % itemCount is 1, it means the item is at the second position, and should have blur(1px).
  // Similarly, if relativeIndex % itemCount is 2, it means the item is at the third position, and should have blur(2px), and so on.
  // For items left to the visible positions, the blur is set to 0 to save cost.
  let blurRadius = 0;
  if (relativeIndex < 0) {
    blurRadius = 0;
  } else if (relativeIndex === itemCount) {
    blurRadius = itemCount;
  } else {
    blurRadius = relativeIndex % itemCount;
  }
  return (
    <motion.div
      key={`${item?.id ?? index}-${index}`}
      className={`relative shrink-0 flex flex-col items-start overflow-hidden h-full`}
      style={{
        width: `128px`,
      }}
      animate={{
        filter: `blur(${blurRadius}px)`,
        opacity: isCurrent ? 1 : 0.8,
      }}
      transition={transition}
    >
      <NavLink
        to={item.to}
        onClick={onClick}
        className={`block w-fit *:w-full *:transition *:fill-accent *:overflow-visible h-10`}
      >
        {item.title === "Home" ? (
          <div className="w-full pl-3">
            <HomeGraphic />
          </div>
        ) : item.title === "About" ? (
          <div className="w-full pl-2 pt-1">
            <AboutGraphic />
          </div>
        ) : item.title === "Projects" ? (
          <div className="w-full pl-2 pt-1">
            <ProjectsGraphic />
          </div>
        ) : (
          <></>
        )}
      </NavLink>
    </motion.div>
  );
}

export default function Nav({ items }: NavProps) {
  const location = useLocation();
  const initialPosition = items.findIndex((e) => location.pathname === e.to);
  const [position, setPosition] = useState<number>(
    initialPosition >= 0 ? initialPosition : 0,
  );

  // Calculate item width based on how many items we have
  const itemCount = items.length || 1;

  // E.g., for 3 items show [a, b, c, a, b, c, a]
  // This makes sure that when its jumping from the 1st c to the 2nd b,
  // there are still (just) enough items to show when the 2nd b goes to position 0
  const itemsForRender = useMemo(() => {
    if (items.length === 0) return [];

    return items.concat(items).concat(items.slice(0, -2));
  }, [items]);

  const x = useMotionValue("0%");
  const [isJumping, setIsJumping] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize position at 0
  useEffect(() => {
    const startingPosition = initialPosition >= 0 ? initialPosition : 0;
    setPosition(startingPosition);
    x.set(`-128 * ${startingPosition}`);
  }, [items.length, x]);

  const effectiveTransition = isJumping ? { duration: 0 } : TRANSITION_SETTINGS;

  const handleAnimationStart = () => {
    setIsAnimating(true);
  };

  const handleAnimationComplete = () => {
    // Jump back when we've scrolled past the original items
    if (position >= items.length) {
      const normalizedPosition = position % items.length;
      setIsJumping(true);
      setPosition(normalizedPosition);
      x.set(`-128 * ${normalizedPosition}`);
      requestAnimationFrame(() => {
        setIsJumping(false);
        setIsAnimating(false);
      });
      return;
    }

    setIsAnimating(false);
  };

  // Always scroll right-to-left (forward direction)
  const handleItemClick = (clickedIndex: number) => {
    // Ignore if already animating or clicking first item
    if (isAnimating || clickedIndex === 0) return;

    const newPosition = position + clickedIndex;

    setPosition(newPosition);
  };

  return (
    <>
      <AnimatePresence>
        {initialPosition !== -1 && (
          <motion.div
            className=""
            key="nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.4, duration: 0.4 } }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={containerRef}
              className={`w-96 overflow-hidden flex`}
            >
              <motion.div
                className="flex"
                style={{
                  x,
                }}
                animate={{ x: -(128 * position) }}
                transition={effectiveTransition}
                onAnimationStart={handleAnimationStart}
                onAnimationComplete={handleAnimationComplete}
              >
                {itemsForRender.map((item, index) => {
                  // Determine which items are currently visible (clickable)
                  const isInView =
                    index >= position && index < position + itemCount;
                  const relativeIndex = index - position; // Position within visible items (0, 1, 2, etc.)

                  return (
                    <NavItem
                      key={`${item?.id ?? index}-${index}`}
                      item={item}
                      index={index}
                      x={x}
                      transition={effectiveTransition}
                      onClick={() => isInView && handleItemClick(relativeIndex)}
                      // Makes it apply to the current active item as well as its copies
                      // So that flickering is avoided during jump
                      isCurrent={relativeIndex % items.length === 0}
                      relativeIndex={relativeIndex}
                      itemCount={itemCount}
                    />
                  );
                })}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
