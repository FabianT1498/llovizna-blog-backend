import {Request, Response} from "express";
import {Types} from "mongoose";

import catchAsync from "@utils/catchAsync";
import {paginate} from "@utils/paginate";

import PostModel from "@models/post";
import User from "@models/typings/user.interface";
import UserModel from "@models/user";

import {validateCreatePost} from "@validations/postValidations";

const createPost = catchAsync(async (req: Request, res: Response) => {
  // Our register logic starts here
  try {
    // Get user input
    const data = req.body ?? {};

    if (!req.file) {
      return res.status(400).json({message: "No picture was uploaded, please select an picture"});
    }

    delete data.pictureCategory

    const {error, value} = validateCreatePost(data);

    if (error) {
      return res.status(400).send(error.details);
    }
    if (req.user) {
      const fileUrl = `posts/${req.file.filename
        }`;

      const postData = {
        ...data,
        userId: new Types.ObjectId(req.user._id),
        picturePath: fileUrl,
      };

      const newPost = new PostModel(postData);

      await newPost.save();

      res
        .status(201)
        .json({message: "Post created successfully", post: postData});
    }
  } catch (err: any) {
    res.status(400).json({message: err.message});
  }
});

const getFeedPosts = catchAsync(async (req: Request, res: Response) => {
  try {
    const data = req.query ?? {};
    let {page, pageSize} = data;
    const user: User | null = await UserModel.findById(
      req.user ? req.user._id : ""
    );

    let pageNumber: number = !page ? 0 : (typeof page === "string" ? parseInt(page) : 0);
    let pageSizeNumber: number = !pageSize ? 10 : (typeof pageSize === "string" ? parseInt(pageSize) : 10);

    let query =
      user &&
      PostModel.find({
        userId: {$in: user.friends},
      }).sort({createdAt: -1});

    if (isNaN(pageNumber)) pageNumber = 0;
    if (isNaN(pageSizeNumber)) pageSizeNumber = 10;

    let result = await paginate(query, pageNumber, pageSizeNumber);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(409).json({error: err.message});
  }
});

const getUserPosts = catchAsync(async (req: Request, res: Response) => {
  try {
    const queryParams = req.query ?? new ReadableStream<Uint8Array>();
    let {page, pageSize} = queryParams;

    const routeParams = req.query ?? new ReadableStream<Uint8Array>();
    let {userId} = routeParams;

    let pageNumber: number = !page ? 0 : Number(page);
    let pageSizeNumber: number = !pageSize ? 0 : Number(pageSize);

    const query = PostModel.find({userId}).sort({
      createdAt: -1,
    });

    if (isNaN(pageNumber)) pageNumber = 0;
    if (isNaN(pageSizeNumber)) pageSizeNumber = 0;

    let result = {};

    if (query) {
      result = await paginate(query, pageNumber, pageSizeNumber);
    }

    res.status(200).json(result);
  } catch (err: any) {
    res.status(409).json({message: err.message});
  }
});

const likePost = catchAsync(async (req: Request, res: Response) => {
  try {
    const routeParams = req.query ?? new ReadableStream<Uint8Array>();

    let {id} = routeParams;

    const post = await PostModel.findById(id);

    if (post && req.user && req.user._id) {
      let userIdString = req.user._id.toString();
      const isLiked = post.likes.get(userIdString);

      if (isLiked) {
        post.likes.delete(userIdString);
      } else {
        post.likes.set(userIdString, true);
      }

      const updatedPost = await PostModel.findByIdAndUpdate(
        id,
        {
          likes: post.likes,
        },
        {new: true}
      );

      res.status(200).json(updatedPost);
    }

    return res.status(404).json({});
  } catch (err: any) {
    res.status(409).json({message: err.message});
  }
});

export {createPost, getFeedPosts, getUserPosts, likePost};
