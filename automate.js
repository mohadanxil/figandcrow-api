
// import { makeApiRequest,makeApiRequestLocal } from 'backend/printifyModule';
// // 'printful',`/files`,"POST",fileUploadBody);
// $w.onReady(async () => {
//     async function fetchWithTimeoutAndRetries(type,url, method="GET",data, timeout = 100000, retries = 5, delay = 10000) {
//         const fetchWithTimeout = async (type,url,method,data, timeout) => {
//             // Returns the fetch call or times out if it takes too long
//             // return Promise.race([
//             //     makeApiRequest(type,url,method,data),
//             //     new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), timeout)),
//             // ]);
//             const response = await makeApiRequest(type,url,method,data)
//             return response;
//         };

//         for (let i = 0; i <= retries; i++) {
//             try {
//                 const response = await fetchWithTimeout(type,url,method,data, timeout);
//                 console.log(response,"response");
//                 if (response?.error) throw new Error(`HTTP error! Status: ${response?.error?.message}`);
//                 const result = await response.result
//                 return result;
//             } catch (error) {
//                 // Retry if retries are left, otherwise throw an error
//                 if (i < retries) {
//                     console.warn(`Attempt ${i + 1} failed, retrying after ${delay / 1000} seconds...`);
//                     await new Promise(res => setTimeout(res, delay));
//                 } else {
//                     throw new Error(`API request failed after ${retries + 1} attempts: ${error?.message}`);
//                 }
//             }
//         }
//     } 
//     // const data = await fetchWithTimeoutAndRetries('printful','/stores');
//     // console.log(data);
//     const TableData = $w('#table1');
//     TableData.rows = [];
//     const uploadButton = $w("#uploadButton2");
//     const waitForCompletion = async (taskKey) => {
//         const checkStatus = async () => {
//             try {
//                 const response = await fetchWithTimeoutAndRetries('printful',`/mockup-generator/task?task_key=${taskKey}`);
//                 console.log(response,":10");
//                 const status = response.status;

//                 if (status === "completed") {
//                     console.log("Task completed:", response);
//                     return response; // Return the result and stop recursion
//                 } else {
//                     console.log("Task status:", status);
//                     return new Promise((resolve) => {
//                         setTimeout(() => resolve(checkStatus()), 1000); // Recur after 5 seconds
//                     });
//                 }
//             } catch (error) {
//                 console.error("Error checking status:", error);
//                 throw new Error("Failed to check task status.");
//             }
//         };

//         // Start checking status
//         return checkStatus();
//     };
//     async function getVariantThumbnail(variantId, variants) {
//         let variantData = {};
//         variants?.map((variant) => {
//             variant?.variant_ids?.map((variant_id) => {
//                 if (variant_id === variantId) {
//                     variantData = variant;
//                 }
//             });
//         });
//         return variantData?.mockup_url;
//     }
//     async function automatePrintful(){
//         const allData = []
//         console.log("Automation Started")
//         // let blueprintIds = [
//         //     "75841254", //cropped sweatshirt
//         // ]
//         let blueprintIds = [
//             // "79345858", //cropped tee
//             // "79419887"
//             "79345860", //hoodie
//             "79345859", //long sleeve tee
//             "79419887", //cropped tee
//             "79345857", //cropped sweatshirt
//             "79345864", //loose tee
//             "79345861", //sweatshirt
//             // "360012755"
//         ]
//         let categoryReport = [
//             { category: "Hoodie", message: 'In Queue', value: '79345860', catalogue:"Unisex Heavy Blend Hoodie | Gildan 18500",templateName:"Unisex Hoodie" },
//             { category: "Longsleeve Tee", message: 'In Queue', value: '79345859', catalogue:"Unisex Long Sleeve Tee | Bella + Canvas 3501",templateName:"Unisex Long Sleeve Tee" },
//             { category: "Cropped T-Shirt", message: 'In Queue', value: '79419887', catalogue:"Women's Crop Top | AS Colour 4062",templateName:"Women’s crop top" },
//             { category: "Cropped Sweatshirt", message: 'In Queue', value: '79345857', catalogue:"Women's Cropped Sweatshirt | Bella + Canvas 7503",templateName:"Crop Sweatshirt" },
//             { category: "Loose Tee", message: 'In Queue', value: '79345864', catalogue:"Unisex Staple T-Shirt | Bella + Canvas 3001",templateName:"Unisex t-shirt" },
//             { category: "Sweatshirt", message: 'In Queue', value: '79345861', catalogue:"Unisex Crew Neck Sweatshirt | Gildan 18000",templateName:"Unisex Sweatshirt" },
//             // { title: "Slim Tee", loading: false, isSuccess: false, currentItem: false, message: 'In Queue', value: '670676dca386b3eb250c443f' },
//         ]
//         function getCategoryIndex(id) {
//             const categoryIndex = categoryReport.findIndex(category => category.value === id);
//             return categoryIndex;
//         }
//         // let blueprintIds = [
//         //     "75841485", //hoodie
//         //     "75842417", //long sleeve tee
//         //     "76226736", //cropped tee
//         //     "75841254", //cropped sweatshirt
//         //     "75840943", //loose tee
//         //     "75841385", //sweatshirt
//         //     // "360012755"
//         // ]
//         const description = $w('#textBox1').value;
//         const uploadFileData = await uploadButton.uploadFiles();
//         const uploadedFile = uploadFileData[0];
//         const fileUploadBody = {
//             url: `https://static.wixstatic.com/media/${uploadedFile?.fileName}`
//         }
//         const fileUpload = await fetchWithTimeoutAndRetries('printful',`/files`,"POST",fileUploadBody);
//         console.log(fileUpload,"fileUpload:18")
//         for (const id of blueprintIds){
//              const categoryIndex = await getCategoryIndex(id);
//             const title = `${$w('#input2').value}, ${categoryReport[categoryIndex]?.title}`;
//             // categoryReport[categoryIndex].message = "Fetching Blueprint";
//             //  $w("#table1").rows = categoryReport;
//             // const blueprint = await fetchWithTimeoutAndRetries('printful',`/product-templates/${id}`,'GET');
//             // console.log(blueprint,"template blueprint :20")
//             // categoryReport[categoryIndex].message = "Fetching Product";
//             //  $w("#table1").rows = categoryReport;
//             // const product = await fetchWithTimeoutAndRetries('printful',`/products/${blueprint?.product_id}`,'GET');
//             // console.log(product,"product fetch :21")

//             // categoryReport[categoryIndex].message = "Creating Variants";
//             //  $w("#table1").rows = categoryReport;
//             // const variants = product?.variants;
//             // // const getCreatedProduct = await fetchWithTimeoutAndRetries('printful',`/store/products/${productCreation?.id}`);
//             // console.log(fileUpload?.id,fileUpload);
//             // categoryReport[categoryIndex].message = "Fetching Design File";
//             //  $w("#table1").rows = categoryReport;
//             const getUploadedFile = await fetchWithTimeoutAndRetries('printful',`/files/${fileUpload?.id}`);
//             // console.log(getUploadedFile,"getUploadedFile:48")
//             // categoryReport[categoryIndex].message = "Creating Mockups";
//             //  $w("#table1").rows = categoryReport;
//             // const mockupBody = {
//             //     variant_ids:blueprint?.available_variant_ids,
//             //     format: 'png',
//             //     files: [
//             //         {
//             //             placement: "front",
//             //             image_url: getUploadedFile?.url,
//             //             position: {
//             //                 area_width: 5000,  // Design area width
//             //                 area_height: 5000,  // Design area height
//             //                 width: 5000,  // Width of the design
//             //                 height: 5000,  // Height of the design
//             //                 top: 0,  // Top offset
//             //                 left: 250  // Left offset
//             //             }
//             //         }
//             //     ]
//             // }
//             // console.log(blueprint?.available_variant_ids,"blueprint,:505",blueprint?.available_variant_ids?.length)
//             // console.log(mockupBody,"mockupBody:68")
//             // categoryReport[categoryIndex].message = "Mockup Generation Initiallized";
//             //  $w("#table1").rows = categoryReport;
//             // const generateMockup = await fetchWithTimeoutAndRetries('printful',`/mockup-generator/create-task/${blueprint?.product_id}`,'POST',mockupBody);
//             // console.log(generateMockup,"generateMockup:63");
//             // // console.log(getCreatedProduct,":66");
//             // const getGeneratedMockup = await fetchWithTimeoutAndRetries('printful',`/mockup-generator/task?task_key=${generateMockup?.task_key}`);
//             // categoryReport[categoryIndex].message = "Generating Mockup";
//             //  $w("#table1").rows = categoryReport;
//             // const mockupDetails = await waitForCompletion(generateMockup?.task_key);
//             // categoryReport[categoryIndex].message = "Fetching Generated Mockup";
//             //  $w("#table1").rows = categoryReport;
//             // console.log(mockupDetails,":101");
//             // console.log(getGeneratedMockup,":67");
//             // // const {sync_product,sync_variants} = getCreatedProduct;
//             // // const updateObj = {
//             // //     sync_product:{
//             // //         ...sync_product,
                    
//             // //         is_ignored:true,
//             // //     },
//             // //     sync_variants:[...sync_variants]
//             // // }
//             // // console.log(updateObj,"updateObj:113");
//             // // const updateProduct = await fetchWithTimeoutAndRetries('printful',`/store/products/${sync_product?.id}`,'PUT',updateObj);
//             // // console.log(updateProduct,"updateProduct:115")
//             // console.log(blueprint)
//             //  let productBody = {
//             //     sync_product: {
//             //         name: title,
//             //         description: description,
//             //         thumbnail: mockupDetails?.mockups[0]?.mockup_url,
//             //     },
//             //     sync_variants: await Promise.all(
//             //         variants
//             //             ?.filter((variant) => {
//             //                 // Stricter filtering
//             //                 return variant?.in_stock && 
//             //                     blueprint?.available_variant_ids?.includes(variant?.id)
//             //             })
//             //             .map(async (variant) => {
//             //                 const variantImage = await getVariantThumbnail(variant?.id, mockupDetails?.mockups);
//             //                 return {
//             //                     variant_id: variant?.id,
//             //                     retail_price: variant?.price,
//             //                     files: [
//             //                         {
//             //                             id: fileUpload?.id,
//             //                             type: "default"
//             //                         }
//             //                     ]
//             //                 };
//             //             })
//             //     )
//             // };


//             // console.log(productBody,"productBody:119");
//             // categoryReport[categoryIndex].message = "Create Product";
//             //  $w("#table1").rows = categoryReport;
//             // const productCreation = await fetchWithTimeoutAndRetries('printful',`/store/products`,'POST',productBody);
//             // console.log(productCreation,"product creation :41")
//             // categoryReport[categoryIndex].message = "Automation Success";
//             // $w("#table1").rows = categoryReport;
//             // const obj = {
//             //     email:"anzilmohd4@gmail.com", 
//             //     password:'junaid@kunna', 
//             //     catelogueName:categoryReport[categoryIndex]?.catalogue, 
//             //     templateName:categoryReport[categoryIndex]?.templateName, 
//             //     imageId:fileUpload?.filename,
//             //     title:title,
//             //     category:categoryReport[categoryIndex]?.category
//             // }
//             // await makeApiRequestLocal("POST",obj)
//             // await fetch('http://localhost:3001/getData',{
//             //     method:"POST",
//             //     body:JSON.stringify(obj),
//             //     headers:{
//             //         'Content-type':"application/json"
//             //     }
//             // })
//             $w('#text81').expand();
//             $w('#text80').expand();
//             $w('#text80').text = getUploadedFile?.filename           
           
            


//         }
//     }
//     $w('#uploadButton2').onChange((event) => {
//         let files = $w('#uploadButton2').value;
//         if (files.length > 0) {
//             $w("#image21").src = "https://static.wixstatic.com/media/908eeb_c91fb8d7c07c4359ad0c3be044ab4055~mv2.gif"
//             $w('#uploadButton2').startUpload()
//                 .then(uploadedFile => {
//                     $w('#image21').src = uploadedFile.url; // Set the image preview element to the uploaded image
//                     $w('#image21').fitMode = "fit"; // Set the image preview element to the uploaded image
//                     $w('#text73').collapse();
                
//                 })
//                 .catch(uploadError => {
//                 });
//         }
//     });

//     $w('#automateBtn').onClick(automatePrintful);



//     // show and hide ui according to the automation tool selection ( printify or printful )

//     // Attach an onChange event handler to the radio button group
//         $w("#radioGroup1").onChange((event) => {
//             // Get the selected value of the radio button group
//             const selectedValue = event.target.value;

//             // Check if the selected value is the one that should trigger hiding elements
//             if (selectedValue === "Printful") {
//                 // Hide the UI elements by their IDs
//                 $w("#group18").collapse();
//                 $w("#group19").collapse();
//                 $w("#column65").collapse();
//                 $w("#checkboxGroup1").collapse();




//                 // $w("#text79").collapse();
//                 // $w("#table1").collapse();
//             } else {
//                 // Optionally, show the elements if a different option is selected
//                 $w("#group18").expand();
//                 $w("#group19").expand();
//                 $w("#column65").expand();
//                 $w("#checkboxGroup1").expand();
//                 // $w("#text79").expand();
//                 // $w("#table1").expand();
//             }
//         });


// });

// start from here 
import { makeApiRequest } from 'backend/printifyModule';
import { getPrintfulTemplates } from 'backend/printfullModule.jsw';
import wixLocation from 'wix-location';
$w.onReady(async () => {
    const StoreId = "14353982"
    const SHOP_ID = '16931390';
    const TableData = $w('#table1');
    TableData.rows = [];
    // $w('#automateBtn').disable();  // Initially disable the button
    // Variables to store the input status
    let isTitleValid = false;
    let isDescriptionValid = false;
    let isPlacementChecked = true;
    let isImageUploaded = false;
    function validateInputs() {
        // if (isTitleValid && isDescriptionValid && isPlacementChecked && isImageUploaded) {
        //     $w('#automateBtn').enable(); // Enable the button if all conditions are met
        // } else {
        //     $w('#automateBtn').disable(); // Disable the button otherwise
        // }
    }
    $w('#input2').onChange(() => {
        isTitleValid = $w('#input2').value.trim() !== ""; // Check if the title is not empty
        validateInputs();
    });

    // Description input validation
    $w('#textBox1').onChange(() => {
        isDescriptionValid = $w('#textBox1').value.trim() !== ""; // Check if the description is not empty
        validateInputs();
    });
    
    function checkPlacements() {
        const checkbox = $w('#checkboxGroup1').value;
        isPlacementChecked = checkbox?.length>0?true:false; // Check if either front or back is selected
        validateInputs();
    }
    $w('#checkboxGroup1').onChange(() => {
        checkPlacements();  // Update validation on checkbox change
    });
    async function uploadImage(file) {
        const formData = new FormData();
        formData.append('file', file); // Append the image file
        const data = {
            file_name:file.fileName,
            url:`https://static.wixstatic.com/media/${file.fileName}`
        }
        try {
            const response = await makeApiRequest("printify",'/uploads/images.json', "POST", data);
            return response; // Return whatever response is expected
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error; // Propagate the error up
        }
    }
    async function automateProductCreationWithImage() {
        const radioBtn = $w('#radioGroup1').value.toLowerCase();
        let categoryReport = [];
        if(radioBtn==="printify"){
            categoryReport = [
                { title: "Slim Tee", loading: false, isSuccess: false, currentItem: false, message: 'In Queue', value: '670676dca386b3eb250c443f' },
                { title: "Hoodie", loading: false, isSuccess: false, currentItem: false, message: 'In Queue', value: '67067a60638a897c3b044ad4' },
                { title: "Long Sleeve Tee", loading: false, isSuccess: false, currentItem: false, message: 'In Queue', value: '670699cee0392d29110c2c79' },
                { title: "Cropped Tee", loading: false, isSuccess: false, currentItem: false, message: 'In Queue', value: '67069ee397ff693c2c0f2101' },
                { title: "Cropped Sweatshirt", loading: false, isSuccess: false, currentItem: false, message: 'In Queue', value: '67069ff92fd03ee35100a222' },
                { title: "Loose Tee", loading: false, isSuccess: false, currentItem: false, message: 'In Queue', value: '67069e0d12871bc2ef0341cb' },
                { title: "Sweatshirt", loading: false, isSuccess: false, currentItem: false, message: 'In Queue', value: '6706993e97ff693c2c0f1f13' },
            ];
        }
        else if(radioBtn==="printful"){
            categoryReport = [
                // { title: "Slim Tee", loading: false, isSuccess: false, currentItem: false, message: 'In Queue', value: '670676dca386b3eb250c443f' },
                { title: "Hoodie", loading: false, isSuccess: false, currentItem: false, message: 'In Queue', value: '75841485' },
                { title: "Long Sleeve Tee", loading: false, isSuccess: false, currentItem: false, message: 'In Queue', value: '75842417' },
                { title: "Cropped Tee", loading: false, isSuccess: false, currentItem: false, message: 'In Queue', value: '76226736' },
                { title: "Cropped Sweatshirt", loading: false, isSuccess: false, currentItem: false, message: 'In Queue', value: '75841254' },
                { title: "Loose Tee", loading: false, isSuccess: false, currentItem: false, message: 'In Queue', value: '75840943' },
                { title: "Sweatshirt", loading: false, isSuccess: false, currentItem: false, message: 'In Queue', value: '75841385' },
            ]
        }

        $w('#table1').rows = await categoryReport;
        $w('#automateBtn').disable();
        const uploadButton = $w("#uploadButton2");
        const uploadFileData = await uploadButton.uploadFiles();
        const checkBox = $w('#checkboxGroup1');

        // Assuming uploadFileData contains the necessary response
        const uploadedFile = uploadFileData[0]; // Assuming single file upload
        console.log(uploadedFile,":108")
        let uploadResponse = null;
        let imageId = uploadedFile?.fileName;
        let blueprintIds = [];
        const title = $w('#input2').value;
        const description = $w('#textBox1').value;
        blueprintIds = [
            // "75841485", //hoodie
            // "75842417", //long sleeve tee
            // "76226736", //cropped tee
            "75841254", //cropped sweatshirt
            // "75840943", //loose tee
            // "75841385", //sweatshirt
            // "360012755"
        ]
        if(radioBtn==="printify"){
            uploadResponse = await uploadImage(uploadedFile);
            if (!uploadResponse) {
                console.log('Image upload failed.');
                return;
            }
            imageId = uploadResponse.id; // Correct way to access ID from response
            blueprintIds = [
                "670676dca386b3eb250c443f", // Slim tee -
                "67067a60638a897c3b044ad4", // hoodie -
                "670699cee0392d29110c2c79", // long sleeve tee -
                "67069ee397ff693c2c0f2101", // cropped T-shirt - 
                "67069ff92fd03ee35100a222", // Cropped Sweatshirt - 
                "67069e0d12871bc2ef0341cb", // Loose Tee - 
                "6706993e97ff693c2c0f1f13", // sweatshirt -
            ];
        }
        function getCategoryIndex(id) {
            const categoryIndex = categoryReport.findIndex(category => category.value === id);
            return categoryIndex;
        }
        async function getSyncVariants(variantIds,imageId){
            const syncVariants = [];
            for(const id of variantIds){
                await makeApiRequest("printful",`/sync/products/${id}`,'GET').then(({result})=>{
                    const {variant,product} = result;
                    const variantObj = {
                        variant_id: variant?.id,
                        retail_price: variant?.price,
                        is_ignored: true,
                        files: product?.files?.map((file)=>{
                            const fileObj = {
                                ...file,
                                url: `https://static.wixstatic.com/media/${imageId}`
                            }
                            return fileObj;
                        }),
                        options:product?.options,
                        availability_status: "active"
                    }
                    syncVariants.push(variantObj)
                })
            }
            return syncVariants;
        }
        let successCount = 0;
        let errorCount = 0;
        let errorCat = [];
        let catArray = [];
        let blueprint = {}
        let productData ={}
        for (const id of blueprintIds) {
            console.log(id,"ids");
            try {
                const categoryIndex = await getCategoryIndex(id);
                categoryReport[categoryIndex].message = "Fetching Blueprint";
                $w("#table1").rows = categoryReport;
                if(radioBtn==="printful"){
                }
                else{
                    blueprint = await makeApiRequest("printify",`/shops/${SHOP_ID}/products/${id}.json`, "GET");
                    productData = {
                        title: `${title},${blueprint?.title}`,
                        description,
                        blueprint_id: blueprint.blueprint_id,
                        print_provider_id: blueprint.print_provider_id,
                        variants: blueprint?.variants?.filter((variant)=>variant.is_enabled&&variant.is_available).map(variant => ({
                            id: variant.id,
                            price: variant.price,
                            is_enabled: true,
                        })),
                        print_areas: blueprint?.print_areas?.map(({ placeholders, ...print_area }) => ({

                            ...print_area,
                            placeholders: placeholders?.filter(placeholder => {
                                if (checkBox.value.includes("front") && placeholder.position === "front") {
                                    return true;
                                }
                                if (checkBox.value.includes("back") && placeholder.position === "back") {
                                    return true;
                                }
                                return false;
                            })?.map(({ position, images, ...placeholder }) => ({
                                ...placeholder,
                                position,
                                images: images?.map(({ id,src,name, ...image }) => ({
                                    ...image,
                                    id: imageId,
                                    name:title,
                                }))
                            }))
                        })),
                        tags: [...blueprint?.tags,"Automated"]
                    };
                    console.log(productData,"productData");
                    
                }
                 console.log(blueprint,"blueprint",radioBtn,":194");
                categoryReport[categoryIndex].message = "Automation In Progess";
                $w("#table1").rows = categoryReport;
                if(radioBtn==="printful"){
                    // await makeApiRequest("printful",`/shops/${SHOP_ID}/products.json`, "POST", productData).then((data)=>{
                    //     if(data?.status==="error"){
                    //         errorCount ++;
                    //         errorCat.push(blueprint?.title)
                    //         categoryReport[categoryIndex].message = "Failed"
                    //     }
                    //     else{
                    //         categoryReport[categoryIndex].message = "Product Automated"
                    //         categoryReport[categoryIndex].view = "https://static.wixstatic.com/media/908eeb_508b772c6df845d8b054207bcf7e2313~mv2.png";
                    //         // $w("#table1").onCellSelect((e) => {
                    //         //     const url = `https://printify.com/app/product-details/${data?.id}?fromProductsPage=1`;
                    //         //     wixLocation.to(url);
                    //         // });
                    //         $w("#table1").rows = categoryReport;
                    //     }
                    // }).catch((err)=>{
                    //     errorCount ++;
                    // })
                    console.log(productData,"printful:214")
                }
                else {
                    console.log(productData,"printify:217")
                    //  await makeApiRequest("printify",`/shops/${SHOP_ID}/products.json`, "POST", productData).then((data)=>{
                    //     if(data?.status==="error"){
                    //         errorCount ++;
                    //         errorCat.push(blueprint?.title)
                    //         categoryReport[categoryIndex].message = "Failed"
                    //     }
                    //     else{
                    //         categoryReport[categoryIndex].message = "Product Automated"
                    //         categoryReport[categoryIndex].view = "https://static.wixstatic.com/media/908eeb_508b772c6df845d8b054207bcf7e2313~mv2.png";
                    //         // $w("#table1").onCellSelect((e) => {
                    //         //     const url = `https://printify.com/app/product-details/${data?.id}?fromProductsPage=1`;
                    //         //     wixLocation.to(url);
                    //         // });
                    //         $w("#table1").rows = categoryReport;
                    //     }
                    // }).catch((err)=>{
                    //     errorCount ++;
                    // })
                }
            } catch (error) {
                console.log('Error fetching or processing blueprint:', error);
            }
        }
       
        if(errorCount>0){
            
            $w('#button8').collapse();
        }
        else{
            $w('#button8').expand();
        }
        
        $w('#automateBtn').enable()
    }
    async function automatePrintful(){
        const uploadButton = $w("#uploadButton2");
        const title = $w('#input2').value;
        const description = $w('#textBox1').value;
        const uploadFileData = await uploadButton.uploadFiles();
        // Assuming uploadFileData contains the necessary response
        const uploadedFile = uploadFileData[0];
        console.log(uploadedFile,uploadFileData,":297");
        const fileUploadBody = {
            url: `https://static.wixstatic.com/media/${uploadedFile?.fileName}`
        }
        const imageUpload = await makeApiRequest('printful',`/files`,"POST",fileUploadBody);
        console.log(imageUpload,":299")
        let blueprintIds = [
            // "75841485", //hoodie
            // "75842417", //long sleeve tee
            // "76226736", //cropped tee
            "75841254", //cropped sweatshirt
            // "75840943", //loose tee
            // "75841385", //sweatshirt
            // "360012755"
        ]
        for (const id of blueprintIds){
            const blueprint = await makeApiRequest('printful',`/product-templates/${id}`,'GET');
            const product = await makeApiRequest('printful',`/products/${blueprint?.result?.product_id}`,'GET');
            const variants = product?.result?.variants;
            console.log(product,"product Details:314",variants)
            console.log(blueprint,"blueprint:315");
            const productBody = {
                sync_product:{
                    name: title,
                    description:description,
                    thumbnail:`https://static.wixstatic.com/media/${uploadedFile?.fileName}`
                },
                sync_variants:variants?.map((variant)=>{
                    return {
                        variant_id: variant?.id,  // Variant ID for M size black sweatshirt
                        price: variant?.price,
                        // sku: "SW-001",
                        files: [
                            {
                                id: imageUpload?.result?.id,  // file_id from the uploaded design
                                type: "default"
                            }
                            // {
                            //     id: imageUpload?.result?.id,  
                            //     type: "mockup"  // explicitly set this for one variant
                            // }
                        ]
                    }
                })
            }
            console.log(productBody);
            const productCreation = await makeApiRequest('printful',`/store/products`,'POST',productBody);
            console.log(productCreation,":351")
        }
    }
    $w('#uploadButton2').onChange((event) => {
        let files = $w('#uploadButton2').value;
        if (files.length > 0) {
            // $w('#text73').expand();
            // $w('#text73').text = "Uploading Image..."
            $w("#image21").src = "https://static.wixstatic.com/media/908eeb_c91fb8d7c07c4359ad0c3be044ab4055~mv2.gif"
            $w('#uploadButton2').startUpload()
                .then(uploadedFile => {
                    $w('#image21').src = uploadedFile.url; // Set the image preview element to the uploaded image
                    $w('#image21').fitMode = "fit"; // Set the image preview element to the uploaded image
                    isImageUploaded = true
                    validateInputs();
                    $w('#text73').collapse();
                
                })
                .catch(uploadError => {
                    isImageUploaded = false
                    validateInputs();
                });
        }
    });

    $w('#automateBtn').onClick(automatePrintful);
});