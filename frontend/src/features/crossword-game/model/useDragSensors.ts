import { TouchSensor, MouseSensor, useSensor, useSensors } from '@dnd-kit/core'

/**
 * Хук для настройки sensors drag & drop с оптимизацией для мобильных устройств
 */
export function useDragSensors() {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 8,
    },
  })
  
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 50,
      tolerance: 5,
    },
  })
  
  return useSensors(mouseSensor, touchSensor)
}
