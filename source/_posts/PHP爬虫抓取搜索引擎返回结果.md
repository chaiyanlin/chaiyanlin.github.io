title: PHP爬虫抓取搜索引擎返回结果
date: 2016-02-14 23:09:17
tags: PHP
---

**前期准备工作**
----------

通常写爬虫脚本，我们都需要先对被抓取对象有一个分析，其中最终要的就是你是否真的需要些爬虫脚本。比如此网站已经提供了对外的API（比如大众点评），又或者通过解析networking发现网站是通过ajax请求某个连接，然后获得json返回值的方式，那就真的不需要写什么爬虫了，而是把重点放在怎么模拟合法地请求连接从而获得json结果。

![](http://r.photo.store.qq.com/psb?/V11nXmZd1imMs1/y9AXD.y7Wk8X6SGLqi3dxKSm4QP.TCv5VAWbcrIG6l8!/r/dHMAAAAAAAAA)
首先检查dom元素发现它是以form-data形式提交，action='/' 表明是提交到当前的url，关键字变量名叫's'。那么好，现在我们需要简单模拟一下表单提交，并获得返回值：
![](http://r.photo.store.qq.com/psb?/V11nXmZd1imMs1/KFjdv9ADbWBfPrLFZUCnipFVHRcEIWPrEbAHEBM7dNU!/r/dFcBAAAAAAAA)
结果和我们预期的一样，返回结果就是搜索结果页面的html。此时要么通过网络抓包，不然的话就只能是爬虫了。
所以要我们写的脚本的输入参数就是搜索的关键字，返回结果就是返回页面html中的标题（title），大小（size），磁力链接（magnet）等信息。当然脚本需要支持多个参数，不然的话岂不是和在浏览器搜索一样？反正就是支持批量化操作，我们只需要批量输入感兴趣的关键字即可，至于返回到结果，也可以先以文件的形式输出，将来也有可能直接写入数据库。

```
php fetch.php 云中行走 港囧 //预计调用方式
```

**外部依赖包引入**
-----------

```
<?php
require_once('Snoopy.php');
require_once('simple_html_dom.php');
```
snoopy是一个php类，用来模仿web浏览器的功能，它能完成获取网页内容和发送表单的任务。要求php4以上就可以。由于本身是php一个类，无需扩支持，服务器不支持curl时候的最好选择。当然还有一个好处它可以设置agent内容，让服务器认为你是浏览器访问，不然有些访问比较严格的比如大众点评会因为某个IP频繁curl请求而把这个IP给屏蔽一天，那就悲剧了。

simple_html_dom 这个PHP类能够很好的解析html dom元素，使用起来很有jquery的即视感，如果前端工作者，在用这个类的时候会感觉非常顺手，简直和用jquery遍历dom元素太像了！

有了上面两个外部依赖，可以说所有底层实现的问题都有着落了，剩下的我们主需要关心逻辑的设计了。


**脚本逻辑设计**
----------

1.通过post请求提交关键字参数，并获得结果返回页的内容（html）；
2.遍历查找html dom元素，捕获结果返回页面中的关注字段，如磁力链接，标题，大小等信息；
3.格式化输出捕获内容；

**Coding**
----------
**通过post请求提交关键字参数，并获得结果返回页的内容（html）**
```
$data = array('s'=> $code); //设置form表单提交内容
$snoopy = new Snoopy(); //实例化Snoopy对象
$snoopy->submit($url, $data); //post方法提交表单到$url，默认是post，可以自改为get方法
$result = $snoopy->results;  //获得返回结果，是html字符串
```

**转换html为PHP对象**
```
$html = str_get_html($result); //没错，就是这么简单，现在$html就是一个php对象
```

**遍历查找html dom元素，捕获结果返回页面中的关注字段，如磁力链接，标题，大小等信息**
这里就涉及到对被抓取页面dom结构的分页和simple_html_dom的使用，这里不准备展开了。这是随便帖几段代码
```
//查找所有class名称为item的div标签
$items = $html->find('div[class=item]'); 
...
//查找第一个class名为item-detail的div，在查找其子元素中的第一个span，并获得其innertext
$magnet = $item->find('div[class=item-detail]', 0)->find('span', 0)->innertext();
```
怎么样？是不是满满的jquery即视感！？有了simple_html_dom，使用PHP遍历查找dom元素的问题就迎刃而解了~


**
遇到的一个小问题
--------
**

在刚开始通过上面那段代码查找磁力链接的时候，返回了如下片段：
```
<span>
    <script language="javascript" type="text/javascript">document.write(decodeURIComponent("%3Ca%"+"20hre"+"f%3D%"+"27mag"+"net%3"+"A%3Fx"+"t%3Du"+"rn%3A"+"btih%"+"3A985"+"DC9FB"+"6CF99"+"55A7D"+"DB444"+"8AEE2"+"ECBD2"+"D5707"+"82%26"+"dn%3D"+"%25E3"+"%2580"+"%2590"+"%25E5"+"%25A4"+"%259A"+"%25E5"+"%25A4"+"%259A"+"%25E5"+"%25BD"+"%25B1"+"%25E9"+"%2599"+"%25A2"+"www-d"+"uotv-"+"cc%25"+"E3%25"+"80%25"+"91%25"+"E4%25"+"BA%25"+"91%25"+"E4%25"+"B8%25"+"AD%25"+"E8%25"+"A1%25"+"8C%25"+"E8%25"+"B5%25"+"B0-10"+"80p%2"+"5E9%2"+"5AB%2"+"598%2"+"5E6%2"+"5B8%2"+"585%2"+"5E8%2"+"58B%2"+"5B1%2"+"5E8%2"+"5AF%2"+"5AD%2"+"5E4%2"+"5B8%2"+"5AD%2"+"5E8%2"+"58B%2"+"5B1%2"+"5E5%2"+"58F%2"+"58C%2"+"5E5%2"+"5AD%2"+"597-m"+"p4%27"+"%3E%5"+"B%E7%"+"A3%81"+"%E5%8"+"A%9B%"+"E9%93"+"%BE%5"+"D%3C%"+"2Fa%3"+"E"));</script>
</span>
```
刚开始感觉很奇怪，之前在页面上明明看到磁力了啊？结果重新再chrome上自细研究，才发现玄机。

```
<span>
    <script language="javascript" type="text/javascript">document.write(decodeURIComponent("%3Ca%"+"20hre"+"f%3D%"+"27mag"+"net%3"+"A%3Fx"+"t%3Du"+"rn%3A"+"btih%"+"3A985"+"DC9FB"+"6CF99"+"55A7D"+"DB444"+"8AEE2"+"ECBD2"+"D5707"+"82%26"+"dn%3D"+"%25E3"+"%2580"+"%2590"+"%25E5"+"%25A4"+"%259A"+"%25E5"+"%25A4"+"%259A"+"%25E5"+"%25BD"+"%25B1"+"%25E9"+"%2599"+"%25A2"+"www-d"+"uotv-"+"cc%25"+"E3%25"+"80%25"+"91%25"+"E4%25"+"BA%25"+"91%25"+"E4%25"+"B8%25"+"AD%25"+"E8%25"+"A1%25"+"8C%25"+"E8%25"+"B5%25"+"B0-10"+"80p%2"+"5E9%2"+"5AB%2"+"598%2"+"5E6%2"+"5B8%2"+"585%2"+"5E8%2"+"58B%2"+"5B1%2"+"5E8%2"+"5AF%2"+"5AD%2"+"5E4%2"+"5B8%2"+"5AD%2"+"5E8%2"+"58B%2"+"5B1%2"+"5E5%2"+"58F%2"+"58C%2"+"5E5%2"+"5AD%2"+"597-m"+"p4%27"+"%3E%5"+"B%E7%"+"A3%81"+"%E5%8"+"A%9B%"+"E9%93"+"%BE%5"+"D%3C%"+"2Fa%3"+"E"));</script>

    <a href="magnet:?xt=urn:btih:985DC9FB6CF9955A7DDB4448AEE2ECBD2D570782&amp;dn=%E3%80%90%E5%A4%9A%E5%A4%9A%E5%BD%B1%E9%99%A2www-duotv-cc%E3%80%91%E4%BA%91%E4%B8%AD%E8%A1%8C%E8%B5%B0-1080p%E9%AB%98%E6%B8%85%E8%8B%B1%E8%AF%AD%E4%B8%AD%E8%8B%B1%E5%8F%8C%E5%AD%97-mp4">[磁力链]</a>
</span>
```
上面这段是浏览器里抠出来的，可以看到下面的a标签里面就是我想要的磁力，可是我们通过Snoopy获取却没有这段，而上面的这段javascript就是问题所在！

很明显网站做了防抓取的措施，如果非浏览器请求获得数据，则不会执行javascript，也就不会得到下面的磁力。想清楚了，解决也很简单：

 1. 通过正则表达式获取decodeURIComponent函数中参数的内容；
 2. 可以看到它还在里面加一些干扰素，接下来再用正则去除字符串中的'+'和'"'，就获得完整的encoded字符串；
 3. 最后通过php函数urldecode即可实现解码，效果和javascript的decodeURIComponent一样；
 
```
function decode_uri_component($str) {
    preg_match('/decodeURIComponent\((.+?)\)/i', $str, $matches, PREG_OFFSET_CAPTURE);
    $str_decoded = preg_replace('/\+/', '', $matches[1][0]);
    $str_decoded = preg_replace('/"/', '', $str_decoded);
    #$str_decoded = iconv('UTF-8', 'UTF-8', urldecode($str_decoded));
    $str_decoded = urldecode($str_decoded);
    return $str_decoded;
}
```



**

最后执行结果
----
```
yanlin@ubuntu:/data/magnet_search$ php fetch.php 云中行走
输入关键字：
Array
(
    [0] => 云中行走
)
查询开始...
正在搜索关键字：云中行走 >>>>>
结果返回10条:
{
title: 18p2p云中行走.HD-720P.MP4.中英字幕
size: 1.92G
magnent: magnet:?xt=urn:btih:FB25ABFD54BDF0044077803263D464D435844F31&dn=18p2p%E4%BA%91%E4%B8%AD%E8%A1%8C%E8%B5%B0-HD-720P-MP4-%E4%B8%AD%E8%8B%B1%E5%AD%97%E5%B9%95
}

{
title: 云中行走.原盘中英字幕.The.Walk.2015.D1080P.X264.AAC.English.CHS-ENG.Mp4a
size: 6.16G
magnent: magnet:?xt=urn:btih:D587C7F9B40E6E1C6534658CD1F9F3B0E5C917E5&dn=%E4%BA%91%E4%B8%AD%E8%A1%8C%E8%B5%B0-%E5%8E%9F%E7%9B%98%E4%B8%AD%E8%8B%B1%E5%AD%97%E5%B9%95-The-Walk-2015-BD1080P-X264-AAC-English-CHS-ENG-Mp4Ba
}

{
title: 【T首发】【Tshoufa.com】[云中行走.走钢索的人][WERip-720P.MKV][2.64G][内封中英]
size: 2.65G
magnent: magnet:?xt=urn:btih:6CDDB4A0EF1C85FBB6378FA49B1D1C913017C777&dn=%E3%80%90BT%E9%A6%96%E5%8F%91%E3%80%91%E3%80%90BTshoufa-com%E3%80%91-%E4%BA%91%E4%B8%AD%E8%A1%8C%E8%B5%B0-%E8%B5%B0%E9%92%A2%E7%B4%A2%E7%9A%84%E4%BA%BA-WEBRip-720P-MKV-2-64GB-%E5%86%85%E5%B0%81%E4%B8%AD%E8%8B%B1-
}

{
title: 【T首发】【Tshoufa.com】[云中行走][luRay-720P.MKV][2.98G][中文字幕]
size: 2.95G
magnent: magnet:?xt=urn:btih:79E7B928EAA5BD12AA06D63FD0E981B000B5F726&dn=%E3%80%90BT%E9%A6%96%E5%8F%91%E3%80%91%E3%80%90BTshoufa-com%E3%80%91-%E4%BA%91%E4%B8%AD%E8%A1%8C%E8%B5%B0-BluRay-720P-MKV-2-98GB-%E4%B8%AD%E6%96%87%E5%AD%97%E5%B9%95-
}

{
title: 云中行走.2015.720p高清英语中英双字[T狗 www.tdog.com]
size: 984.46M
magnent: magnet:?xt=urn:btih:7728FE88112D86C400CADFA4F1FC901446258980&dn=%E4%BA%91%E4%B8%AD%E8%A1%8C%E8%B5%B0-2015-720p%E9%AB%98%E6%B8%85%E8%8B%B1%E8%AF%AD%E4%B8%AD%E8%8B%B1%E5%8F%8C%E5%AD%97-BT%E7%8B%97-www-btdog-com-
}

{
title: [Yoyozz.com]云中行走.HD-720P.MP4.中英字幕
size: 1.92G
magnent: magnet:?xt=urn:btih:464B1221941700099585C7DF32607F17E42828AC&dn=-Yoyozz-com-%E4%BA%91%E4%B8%AD%E8%A1%8C%E8%B5%B0-HD-720P-MP4-%E4%B8%AD%E8%8B%B1%E5%AD%97%E5%B9%95
}

{
title: 【多多影院www.duotv.cc】云中行走.1080p高清英语中英双字.mp4
size: 1.13G
magnent: magnet:?xt=urn:btih:985DC9FB6CF9955A7DDB4448AEE2ECBD2D570782&dn=%E3%80%90%E5%A4%9A%E5%A4%9A%E5%BD%B1%E9%99%A2www-duotv-cc%E3%80%91%E4%BA%91%E4%B8%AD%E8%A1%8C%E8%B5%B0-1080p%E9%AB%98%E6%B8%85%E8%8B%B1%E8%AF%AD%E4%B8%AD%E8%8B%B1%E5%8F%8C%E5%AD%97-mp4
}

{
title: 云中行走D中英双字D中英双字1280高清【6v电影www.6vhao.net】.rmv
size: 1.23G
magnent: magnet:?xt=urn:btih:412D1DD70032545FB2FA1F0D8CA0EDE3E57D040B&dn=%E4%BA%91%E4%B8%AD%E8%A1%8C%E8%B5%B0BD%E4%B8%AD%E8%8B%B1%E5%8F%8C%E5%AD%97BD%E4%B8%AD%E8%8B%B1%E5%8F%8C%E5%AD%971280%E9%AB%98%E6%B8%85%E3%80%906v%E7%94%B5%E5%BD%B1www-6vhao-net%E3%80%91-rmvb
}

{
title: 梦幻天堂·龙网(lwgod.com).720p.云中行走.命悬一线.走钢索的人
size: 3.73G
magnent: magnet:?xt=urn:btih:D307736560B48FA94CF3982FD2475832D154DFB0&dn=%E6%A2%A6%E5%B9%BB%E5%A4%A9%E5%A0%82%C2%B7%E9%BE%99%E7%BD%91-lwgod-com-720p-%E4%BA%91%E4%B8%AD%E8%A1%8C%E8%B5%B0-%E5%91%BD%E6%82%AC%E4%B8%80%E7%BA%BF-%E8%B5%B0%E9%92%A2%E7%B4%A2%E7%9A%84%E4%BA%BA
}

{
title: 云中行走.原盘中英字幕.The.Walk.2015.D720P.X264.AAC.English.CHS-ENG.Mp4a
size: 2.55G
magnent: magnet:?xt=urn:btih:913EF381297CD99136FFECF41E4F942309E4A47E&dn=%E4%BA%91%E4%B8%AD%E8%A1%8C%E8%B5%B0-%E5%8E%9F%E7%9B%98%E4%B8%AD%E8%8B%B1%E5%AD%97%E5%B9%95-The-Walk-2015-BD720P-X264-AAC-English-CHS-ENG-Mp4Ba
}

<<<<<



{
    "云中行走": [
        {
            "title": "18p2p云中行走.HD-720P.MP4.中英字幕",
            "size": "1.92G",
            "magnent": "magnet:?xt=urn:btih:FB25ABFD54BDF0044077803263D464D435844F31&dn=18p2p%E4%BA%91%E4%B8%AD%E8%A1%8C%E8%B5%B0-HD-720P-MP4-%E4%B8%AD%E8%8B%B1%E5%AD%97%E5%B9%95"
        },
        {
            "title": "云中行走.原盘中英字幕.The.Walk.2015.D1080P.X264.AAC.English.CHS-ENG.Mp4a",
            "size": "6.16G",
            "magnent": "magnet:?xt=urn:btih:D587C7F9B40E6E1C6534658CD1F9F3B0E5C917E5&dn=%E4%BA%91%E4%B8%AD%E8%A1%8C%E8%B5%B0-%E5%8E%9F%E7%9B%98%E4%B8%AD%E8%8B%B1%E5%AD%97%E5%B9%95-The-Walk-2015-BD1080P-X264-AAC-English-CHS-ENG-Mp4Ba"
        },
        {
            "title": "【T首发】【Tshoufa.com】[云中行走.走钢索的人][WERip-720P.MKV][2.64G][内封中英]",
            "size": "2.65G",
            "magnent": "magnet:?xt=urn:btih:6CDDB4A0EF1C85FBB6378FA49B1D1C913017C777&dn=%E3%80%90BT%E9%A6%96%E5%8F%91%E3%80%91%E3%80%90BTshoufa-com%E3%80%91-%E4%BA%91%E4%B8%AD%E8%A1%8C%E8%B5%B0-%E8%B5%B0%E9%92%A2%E7%B4%A2%E7%9A%84%E4%BA%BA-WEBRip-720P-MKV-2-64GB-%E5%86%85%E5%B0%81%E4%B8%AD%E8%8B%B1-"
        },
        {
            "title": "【T首发】【Tshoufa.com】[云中行走][luRay-720P.MKV][2.98G][中文字幕]",
            "size": "2.95G",
            "magnent": "magnet:?xt=urn:btih:79E7B928EAA5BD12AA06D63FD0E981B000B5F726&dn=%E3%80%90BT%E9%A6%96%E5%8F%91%E3%80%91%E3%80%90BTshoufa-com%E3%80%91-%E4%BA%91%E4%B8%AD%E8%A1%8C%E8%B5%B0-BluRay-720P-MKV-2-98GB-%E4%B8%AD%E6%96%87%E5%AD%97%E5%B9%95-"
        },
        {
            "title": "云中行走.2015.720p高清英语中英双字[T狗 www.tdog.com]",
            "size": "984.46M",
            "magnent": "magnet:?xt=urn:btih:7728FE88112D86C400CADFA4F1FC901446258980&dn=%E4%BA%91%E4%B8%AD%E8%A1%8C%E8%B5%B0-2015-720p%E9%AB%98%E6%B8%85%E8%8B%B1%E8%AF%AD%E4%B8%AD%E8%8B%B1%E5%8F%8C%E5%AD%97-BT%E7%8B%97-www-btdog-com-"
        },
        {
            "title": "[Yoyozz.com]云中行走.HD-720P.MP4.中英字幕",
            "size": "1.92G",
            "magnent": "magnet:?xt=urn:btih:464B1221941700099585C7DF32607F17E42828AC&dn=-Yoyozz-com-%E4%BA%91%E4%B8%AD%E8%A1%8C%E8%B5%B0-HD-720P-MP4-%E4%B8%AD%E8%8B%B1%E5%AD%97%E5%B9%95"
        },
        {
            "title": "【多多影院www.duotv.cc】云中行走.1080p高清英语中英双字.mp4",
            "size": "1.13G",
            "magnent": "magnet:?xt=urn:btih:985DC9FB6CF9955A7DDB4448AEE2ECBD2D570782&dn=%E3%80%90%E5%A4%9A%E5%A4%9A%E5%BD%B1%E9%99%A2www-duotv-cc%E3%80%91%E4%BA%91%E4%B8%AD%E8%A1%8C%E8%B5%B0-1080p%E9%AB%98%E6%B8%85%E8%8B%B1%E8%AF%AD%E4%B8%AD%E8%8B%B1%E5%8F%8C%E5%AD%97-mp4"
        },
        {
            "title": "云中行走D中英双字D中英双字1280高清【6v电影www.6vhao.net】.rmv",
            "size": "1.23G",
            "magnent": "magnet:?xt=urn:btih:412D1DD70032545FB2FA1F0D8CA0EDE3E57D040B&dn=%E4%BA%91%E4%B8%AD%E8%A1%8C%E8%B5%B0BD%E4%B8%AD%E8%8B%B1%E5%8F%8C%E5%AD%97BD%E4%B8%AD%E8%8B%B1%E5%8F%8C%E5%AD%971280%E9%AB%98%E6%B8%85%E3%80%906v%E7%94%B5%E5%BD%B1www-6vhao-net%E3%80%91-rmvb"
        },
        {
            "title": "梦幻天堂·龙网(lwgod.com).720p.云中行走.命悬一线.走钢索的人",
            "size": "3.73G",
            "magnent": "magnet:?xt=urn:btih:D307736560B48FA94CF3982FD2475832D154DFB0&dn=%E6%A2%A6%E5%B9%BB%E5%A4%A9%E5%A0%82%C2%B7%E9%BE%99%E7%BD%91-lwgod-com-720p-%E4%BA%91%E4%B8%AD%E8%A1%8C%E8%B5%B0-%E5%91%BD%E6%82%AC%E4%B8%80%E7%BA%BF-%E8%B5%B0%E9%92%A2%E7%B4%A2%E7%9A%84%E4%BA%BA"
        },
        {
            "title": "云中行走.原盘中英字幕.The.Walk.2015.D720P.X264.AAC.English.CHS-ENG.Mp4a",
            "size": "2.55G",
            "magnent": "magnet:?xt=urn:btih:913EF381297CD99136FFECF41E4F942309E4A47E&dn=%E4%BA%91%E4%B8%AD%E8%A1%8C%E8%B5%B0-%E5%8E%9F%E7%9B%98%E4%B8%AD%E8%8B%B1%E5%AD%97%E5%B9%95-The-Walk-2015-BD720P-X264-AAC-English-CHS-ENG-Mp4Ba"
        }
    ]
}
查询结束...
```

**