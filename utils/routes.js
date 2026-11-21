export function resourceRoutes(controller) {
  return [
    { method: 'GET', path: [], handler: controller.list },
    { method: 'POST', path: [], handler: controller.create },
    { method: 'GET', path: [':id'], handler: controller.read },
    { method: 'PUT', path: [':id'], handler: controller.update },
    { method: 'DELETE', path: [':id'], handler: controller.remove },
  ]
}
