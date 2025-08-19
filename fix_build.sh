#!/bin/bash
# 批量修复所有构建错误

FILE="src/services/business.ts"

# 修复所有 items 返回类型问题
sed -i '279,287c\
    return {\
      items: items as unknown as ISupplier[],\
      total,\
      page: pagination.page,\
      pageSize: pagination.pageSize,\
      totalPages: Math.ceil(total / pagination.pageSize)\
    };' $FILE

sed -i '425,433c\
    return {\
      items: items as unknown as IInboundOrder[],\
      total,\
      page: pagination.page,\
      pageSize: pagination.pageSize,\
      totalPages: Math.ceil(total / pagination.pageSize)\
    };' $FILE

# 修复单个查询类型问题  
sed -i 's/return Supplier\.findById(id)\.lean();/return Supplier.findById(id).lean() as unknown as ISupplier | null;/g' $FILE
sed -i 's/return User\.findById(id)\.lean();/return User.findById(id).lean() as unknown as IUser | null;/g' $FILE
sed -i 's/return User\.findOne.*\.lean();/return User.findOne({ username: username.trim() }).lean() as unknown as IUser | null;/g' $FILE

# 修复 map 函数中的类型问题
sed -i 's/suppliers => suppliers\.map(s =>/suppliers => suppliers.map((s: any) =>/g' $FILE

# 修复其他类型断言问题
sed -i 's/inbound\._id\.toString()/\(inbound._id as any\).toString()/g' $FILE
sed -i 's/item\._id\.toString()/\(item._id as any\).toString()/g' $FILE

echo "构建错误修复完成"