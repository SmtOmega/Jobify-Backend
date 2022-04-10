const express = require("express");
const moment = require('moment')
const Job = require("../models/jobModel");
const checkPermissions = require("../util/checkPermission");
const router = express.Router();

router.post("/", async (req, res) => {
  const { company, position } = req.body;
  try {
    const job = new Job({ ...req.body, createdBy: req.user._id });
    if (!company || !position) {
      throw new Error("Please provide all values");
    }
    await job.save();
    res.status(201).json({ job });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
});

router.get("/", async (req, res) => {
  const {sort, search, status, jobType} = req.query
  try {
    const queryObjects = {
      createdBy: req.user._id
    }

    if(status && status !== 'all'){
      queryObjects.status = status
    }
    if(jobType && jobType !== 'all'){
      queryObjects.jobType = jobType
    }

    if(search){
      queryObjects.position = {$regex: search, $options: 'i'}
    }


    let result =  Job.find(queryObjects);

    if(sort === 'latest'){
      result = result.sort('-createdAt')
    }
    if(sort === 'oldest'){
      result = result.sort('createdAt')
    }
    if(sort === 'a-z'){
      result = result.sort('position')
    }
    if(sort === 'z-a'){
      result = result.sort('-position')
    }

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit


    result = result.skip(skip).limit(limit)
    const jobs = await result

    const totalJobs = await Job.countDocuments(queryObjects)
    const numOfPages = Math.ceil(totalJobs / limit)
    res.status(200).json({ jobs, totalJobs, numOfPages });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
});

router.get("/stats", async (req, res) => {
  try {
    let stats = await Job.aggregate([
      {
        $match: { createdBy: req.user._id },
      },
      {
        $group: { _id: "$status", count: { $sum: 1 } },
      },
    ]);
    stats = stats.reduce((acc, curr) => {
      const { _id: title, count } = curr;
      acc[title] = count;
      return acc;
    }, {});

    const defaultStats = {
      pending: stats.pending || 0,
      interview: stats.interview || 0,
      declined: stats.declined || 0,
    };

    let monthlyApplications = await Job.aggregate([
      {
        $match: { createdBy: req.user._id },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: {$sum: 1}
        },
      },
      {
        $sort: {'_id.year': -1, '_id.month': -1}
      },
      {
        $limit: 6
      }
    ]);
    monthlyApplications = monthlyApplications.map(item => {
      const {_id: {year, month}, count} = item
      const date = moment().month(month - 1).year(year).format('MMM Y')
      return {date, count}
    }).reverse()
    res.status(200).json({ defaultStats, monthlyApplications });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  const { id: jobId } = req.params;

  try {
    const job = await Job.findOne({ _id: jobId });

    if (!job) {
      throw new Error(`There is  no job with the id: ${jobId}`);
    }
    checkPermissions(req.user, job.createdBy);
    await job.remove();

    res.status(200).json({ msg: "Success! Job removed" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
});

router.patch("/:id", async (req, res) => {
  const { id: jobId } = req.params;
  const { company, position } = req.body;
  const updates = Object.keys(req.body);
  try {
    if (!company || !position) {
      throw new Error("Please provide all value");
    }

    const job = await Job.findOne({ _id: jobId });

    if (!job) {
      throw new Error(`There is  no job with the id: ${jobId}`);
    }

    checkPermissions(req.user, job.createdBy);

    updates.forEach((update) => (job[update] = req.body[update]));

    await job.save();
    res.status(200).json({ job });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
});

module.exports = router;
