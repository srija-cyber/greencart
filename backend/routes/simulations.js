import express from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import simulationRunner from '../services/simulationRunner.js';

const router = express.Router();

// Start a new simulation
router.post('/start', auth, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { name, duration, driverIds, orderIds, params } = req.body;
    const io = req.io; // Get the Socket.IO instance from req

    if (!name || !duration || !Array.isArray(driverIds) || !Array.isArray(orderIds)) {
      return res.status(400).json({ message: 'Missing required simulation parameters.' });
    }

    const runId = await simulationRunner.startSimulation(io, { 
      name, 
      duration, 
      driverIds, 
      orderIds, 
      params,
      userId: req.user.id // Pass the authenticated user's ID
    });
    res.status(200).json({ message: 'Simulation started', runId, status: 'started' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to start simulation', error: error.message });
  }
});

// Stop a running simulation
router.post('/:runId/stop', auth, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { runId } = req.params;
    const stopped = await simulationRunner.stopSimulation(runId);
    if (stopped) {
      res.status(200).json({ message: `Simulation ${runId} stopped.` });
    } else {
      res.status(404).json({ message: `Simulation ${runId} not found or already stopped.` });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to stop simulation', error: error.message });
  }
});

// Get simulation status
router.get('/:runId/status', auth, requireRole(['admin', 'manager', 'dispatcher']), (req, res) => {
  try {
    const { runId } = req.params;
    const status = simulationRunner.getSimulationStatus(runId);
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get simulation status', error: error.message });
  }
});

// Get all simulation runs (history)
router.get('/', auth, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { status, dateFrom, dateTo, limit } = req.query;
    const filters = {};
    
    if (status) filters.status = status;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (limit) filters.limit = parseInt(limit);

    const simulations = await simulationRunner.getAllSimulations(filters);
    res.status(200).json({ 
      simulations,
      total: simulations.length,
      filters 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch simulation history', error: error.message });
  }
});

// Get specific simulation run details
router.get('/:runId', auth, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { runId } = req.params;
    const simulation = await simulationRunner.getSimulationById(runId);
    
    if (!simulation) {
      return res.status(404).json({ message: `Simulation ${runId} not found.` });
    }
    
    res.status(200).json(simulation);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch simulation details', error: error.message });
  }
});

// Get simulation results
router.get('/:runId/results', auth, requireRole(['admin', 'manager', 'dispatcher']), async (req, res) => {
  try {
    const { runId } = req.params;
    const simulation = await simulationRunner.getSimulationById(runId);
    
    if (!simulation) {
      return res.status(404).json({ message: `Simulation ${runId} not found.` });
    }
    
    res.status(200).json({
      runId: simulation.runId,
      name: simulation.name,
      status: simulation.status,
      startTime: simulation.startTime,
      endTime: simulation.endTime,
      duration: simulation.duration,
      results: simulation.results,
      telemetryCount: simulation.telemetryCount,
      eventsCount: simulation.eventsCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch simulation results', error: error.message });
  }
});

export default router;


