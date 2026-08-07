class ApiFeatures {
    /**
    * @desc    Initialize API features
    * @param   {Object} query     Mongoose query object (Product.find())
    * @param   {Object} queryStr  Request query parameters (req.query)
    */
    constructor(query, queryStr) {

        /**
         * 
         */
        this.query = query;
        this.queryStr = queryStr;
    }

    // SEARCH FEATURE
    /**
     * @desc    Search products by keyword
     * @route   GET /api/v1/products?keyword=value
     * @access  Public
     * 
     * This performs a case-insensitive search on the product name.
     * 
     * @example
     * // Search for products containing "iphone"
     * const apiFeatures = new ApiFeatures(Product.find(), req.query);
     * apiFeatures.search();
     * 
     * @returns {ApiFeatures} - Returns the ApiFeatures instance for chaining
     */
    search(){
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword, // regex for pattern matching
                $options: "i" // case insensitive
            }
        } : {};
        this.query = this.query.find({ ...keyword }); // spread operator to merge keyword with query
        return this;
    }


    // FILTER FEATURE

    /**
     * @desc    Filter products using query parameters
     * @route   GET /api/v1/products
     * @query   ?price[gte]=5000&price[lte]=20000
     * @access  Public
     *
     * Supported operators:
     * gte  → greater than or equal
     * gt   → greater than
     * lte  → less than or equal
     * lt   → less than
     *
     * Example:
     * /api/v1/products?price[gte]=5000
    */

    filter(){
        // Copy query object to avoid mutating original
        const queryCopy = {...this.queryStr};

        // console.log(queryCopy);
        // console.log(this.query);

        // Remove fields that are not related to filtering
        const removeFields = ["keyword", "limit", "page"]
        removeFields.forEach(ele => delete queryCopy[ele])  

        /**
        * Convert query object to string so we can
        * replace operators with MongoDB operators
        */
        let queryStr = JSON.stringify(queryCopy)

        /**
        * Replace:
        * gte → $gte
        * lte → $lte
        * gt  → $gt
        * lt  → $lt
        */
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`)

        // Convert string back to object
        const parsedQuery = JSON.parse(queryStr);
        // Convert price filters to numbers
        /**
         * Convert numeric values because query parameters arrive as strings.
         * MongoDB numeric comparison requires numbers.
         */
        if(parsedQuery.price){
            if(parsedQuery.price.$gte) parsedQuery.price.$gte = Number(parsedQuery.price.$gte)
            if(parsedQuery.price.$lte) parsedQuery.price.$lte = Number(parsedQuery.price.$lte)
            if(parsedQuery.price.$gt) parsedQuery.price.$gt = Number(parsedQuery.price.$gt)
            if(parsedQuery.price.$lt) parsedQuery.price.$lt = Number(parsedQuery.price.$lt)
        }
        // Apply filters to the MongoDB query
        this.query = this.query.find(parsedQuery);
        return this;
              
        
    }

    // PAGINATION FEATURE

    /**
     * @desc    Paginate query results
     * @route   GET /api/v1/products
     * @query   ?page=2
     * @access  Public
     *
     * Example:
     * /api/v1/products?page=2
     * /api/v1/products?page=2&limit=10
     */

    pagination(resultPerPage){
        // Determine current page
        const currentPage = Number(this.queryStr.page) || 1;
        // Calculate how many documents to skip
        const skip = (currentPage - 1) * resultPerPage;

        // Apply limit and skip to the query
        this.query = this.query.limit(resultPerPage).skip(skip);
        return this;
    }
}

export default ApiFeatures;