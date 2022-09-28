import React from "react"
import { Skeleton } from "@mui/material"

function SkeletonItems() {
    return (
        <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col w-96">
                <Skeleton
                    variant="rectangular"
                    width={480}
                    height={280}
                    className="ml-2 rounded-md"
                />
                <div className="flex ml-4 justify-around w-full my-2 pr-4">
                    <Skeleton
                        variant="rectangular"
                        width={124}
                        height={30}
                        className="ml-2 rounded-md"
                    />
                    <Skeleton
                        variant="rectangular"
                        width={124}
                        height={30}
                        className="ml-2 rounded-md"
                    />
                    <Skeleton
                        variant="rectangular"
                        width={124}
                        height={30}
                        className="ml-2 rounded-md"
                    />
                </div>
                <div className="flex flex-col">
                    <Skeleton
                        variant="rectangular"
                        width={476}
                        height={18}
                        className="ml-2 rounded-md my-1"
                    />
                    <Skeleton
                        variant="rectangular"
                        width={476}
                        height={18}
                        className="ml-2 rounded-md my-1"
                    />
                    <Skeleton
                        variant="rectangular"
                        width={476}
                        height={18}
                        className="ml-2 rounded-md my-1"
                    />
                    <Skeleton
                        variant="rectangular"
                        width={476}
                        height={18}
                        className="ml-2 rounded-md my-1"
                    />
                </div>
            </div>
            <div className="flex flex-col w-96">
                <Skeleton
                    variant="rectangular"
                    width={480}
                    height={280}
                    className="ml-2 rounded-md"
                />
                <div className="flex ml-4 justify-around w-full my-2 pr-4">
                    <Skeleton
                        variant="rectangular"
                        width={124}
                        height={30}
                        className="ml-2 rounded-md"
                    />
                    <Skeleton
                        variant="rectangular"
                        width={124}
                        height={30}
                        className="ml-2 rounded-md"
                    />
                    <Skeleton
                        variant="rectangular"
                        width={124}
                        height={30}
                        className="ml-2 rounded-md"
                    />
                </div>
                <div className="flex flex-col">
                    <Skeleton
                        variant="rectangular"
                        width={476}
                        height={18}
                        className="ml-2 rounded-md my-1"
                    />
                    <Skeleton
                        variant="rectangular"
                        width={476}
                        height={18}
                        className="ml-2 rounded-md my-1"
                    />
                    <Skeleton
                        variant="rectangular"
                        width={476}
                        height={18}
                        className="ml-2 rounded-md my-1"
                    />
                    <Skeleton
                        variant="rectangular"
                        width={476}
                        height={18}
                        className="ml-2 rounded-md my-1"
                    />
                </div>
            </div>
            <div className="flex flex-col w-96">
                <Skeleton
                    variant="rectangular"
                    width={480}
                    height={280}
                    className="ml-2 rounded-md"
                />
                <div className="flex ml-4 justify-around w-full my-2 pr-4">
                    <Skeleton
                        variant="rectangular"
                        width={124}
                        height={30}
                        className="ml-2 rounded-md"
                    />
                    <Skeleton
                        variant="rectangular"
                        width={124}
                        height={30}
                        className="ml-2 rounded-md"
                    />
                    <Skeleton
                        variant="rectangular"
                        width={124}
                        height={30}
                        className="ml-2 rounded-md"
                    />
                </div>
                <div className="flex flex-col">
                    <Skeleton
                        variant="rectangular"
                        width={476}
                        height={18}
                        className="ml-2 rounded-md my-1"
                    />
                    <Skeleton
                        variant="rectangular"
                        width={476}
                        height={18}
                        className="ml-2 rounded-md my-1"
                    />
                    <Skeleton
                        variant="rectangular"
                        width={476}
                        height={18}
                        className="ml-2 rounded-md my-1"
                    />
                    <Skeleton
                        variant="rectangular"
                        width={476}
                        height={18}
                        className="ml-2 rounded-md my-1"
                    />
                </div>
            </div>
        </div>
    )
}

export default SkeletonItems
