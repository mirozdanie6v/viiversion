import { Hono } from 'hono'

import {
  getDemoAvailability,
  getTourBySlug,
  listDestinations,
  listTours,
} from '../catalog/service'
import { resolveDemoSession } from '../demo/http'
import type { AppEnv } from '../types'

export const catalogRoutes = new Hono<AppEnv>()

catalogRoutes.get('/destinations', async (c) => {
  const session = await resolveDemoSession(c)
  const destinations = await listDestinations(c.env.DB, session.id)

  return c.json({
    ok: true,
    destinations,
    provenance: {
      verifiedBase: true,
      sessionScopedDemoAdditions: true,
    },
    requestId: c.get('requestId'),
  })
})

catalogRoutes.get('/tours', async (c) => {
  const session = await resolveDemoSession(c)
  const destination = c.req.query('destination')?.trim() || undefined
  const category = c.req.query('category')?.trim() || undefined
  const tours = await listTours(c.env.DB, session.id, { destination, category })

  return c.json({
    ok: true,
    tours,
    provenance: {
      verifiedBase: true,
      sessionScopedOverrides: true,
    },
    requestId: c.get('requestId'),
  })
})

catalogRoutes.get('/tours/:id/availability', async (c) => {
  const session = await resolveDemoSession(c)
  const availability = await getDemoAvailability(c.env.DB, session.id, c.req.param('id'))

  return c.json({
    ok: true,
    availability,
    availabilityType: 'demo_only',
    dataStatus: 'demo_availability',
    message: 'Availability is simulated unless MAX TOUR publishes or integrates live inventory.',
    requestId: c.get('requestId'),
  })
})

catalogRoutes.get('/tours/:slug', async (c) => {
  const session = await resolveDemoSession(c)
  const tour = await getTourBySlug(c.env.DB, session.id, c.req.param('slug'))

  if (!tour) {
    return c.json(
      {
        ok: false,
        error: {
          code: 'TOUR_NOT_FOUND',
          message: 'Tour not found',
        },
        requestId: c.get('requestId'),
      },
      404,
    )
  }

  return c.json({
    ok: true,
    tour,
    requestId: c.get('requestId'),
  })
})
