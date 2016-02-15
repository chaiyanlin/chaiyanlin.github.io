title: Git服务器上的项目迁移到其他服务器上的详细说明
date: 2016-02-02 20:32:55
tags: git
---

![](http://image.slidesharecdn.com/gitworkshop-nuzhdinlab-june-2014-140601193331-phpapp01/95/git-introduction-workshop-for-scientists-1-638.jpg?cb=1402457817)

有一个项目一直是再我们localhost服务器A下使用的git做的开发。最近需要搬移到线上的服务器B上。
目的：要保留原有的所有的开发记录。
一开始，我准备是直接clone一份最新的，然后以这个为原始版本开创建，发现这个是不可取的。
最后想到的一个办法就是，登陆到A上面，切换到git用户组，使用scp将整个repositories下的项目目录copy到服务器B的git repositories下。那样就能保留原有的文件所有者规git所有。然后在服务器B上创建一个跟刚才copy过去的项目。就可以直接在本地使用B服务器上的git地址进行开发了。
如果您是使用的别人的git仓库，比如github。那就看看下面这篇我在网上找的文章：
如果你想从别的 Git 托管服务那里复制一份源代码到新的 Git 托管服务器上的话，可以通过以下步骤来操作。
1). 从原地址克隆一份裸版本库，比如原本托管于 GitCafe。
        ```
        git clone –bare git@gitcafe.com:username/project.git
        ```
2). 然后到新的 Git 服务器上创建一个新项目，比如 GitHub。
3). 以镜像推送的方式上传代码到 GitHub 服务器上。
        ```
        cd project.git
        git push –mirror git@github.com:username/newproject.git
        ```
4). 删除本地代码
        ```
        rm -rf project.git
        ```
5). 到新服务器 GitCafe 上找到 Clone 地址，直接 Clone 到本地就可以了。
        ```
        git clone git@github.com:username/newproject.git
        ```
这种方式可以保留原版本库中的所有内容。
