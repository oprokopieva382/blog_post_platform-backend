import { ObjectId } from "mongodb";
import { injectable } from "inversify";
import { BlogDBType, PostDBType } from "../cloud_DB";
import { BlogViewModel, Paginator } from "../type-models";
import { QueryType } from "../types/query-type";
import { ApiError } from "../helper/api-errors";
import { BlogDTO } from "../DTO";
import { BlogModel, PostModel } from "../models";

@injectable()
export class BlogQueryRepository {
  async getPostsOfBlog(blogId: string, query: QueryType) {
    const totalPostsCount = await PostModel.countDocuments({
      blog: blogId.toString(),
    });

    const posts: PostDBType[] = await PostModel.find({
      blog: blogId.toString(),
    })
      .populate(["blog", "reactionInfo"])
      .skip((query.pageNumber - 1) * query.pageSize)
      .limit(query.pageSize)
      .sort({ [query.sortBy]: query.sortDirection })
      .lean();

    const postsToView = {
      pagesCount: Math.ceil(totalPostsCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalPostsCount,
      items: posts,
    };

    return postsToView;
  }

  async getAllBlogs(query: QueryType): Promise<Paginator<BlogViewModel>> {
    const search = query.searchNameTerm
      ? { name: { $regex: query.searchNameTerm, $options: "i" } }
      : {};

    const totalBlogsCount = await BlogModel.countDocuments({
      ...search,
    });

    const blogs: BlogDBType[] = await BlogModel.find(search)
      .skip((query.pageNumber - 1) * query.pageSize)
      .limit(query.pageSize)
      .sort({ [query.sortBy]: query.sortDirection })
      .lean();

    const blogsToView = {
      pagesCount: Math.ceil(totalBlogsCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalBlogsCount,
      items: blogs.map((b) => BlogDTO.transform(b)),
    };

    return blogsToView;
  }

  async getByIdBlog(id: string): Promise<BlogViewModel> {
    const foundBlog = await BlogModel.findOne({
      _id: new ObjectId(id),
    });

    if (!foundBlog) {
      throw ApiError.NotFoundError("Not found", ["No blog found"]);
    }

    return BlogDTO.transform(foundBlog);
  }
}
