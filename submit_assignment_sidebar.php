<div class="span3" id="">
	<div class="row-fluid">
				      <!-- block -->
                        <div id="block_bg" class="block">
                            <div class="navbar navbar-inner block-header">
                                <div id="" class="muted pull-left"><h4><i class="icon-plus-sign"></i> Add Downloadable</h4></div>
                            </div>
                            <div class="block-content collapse in">
                                <div class="span12">
						<form id="add_assignment"   method="post" enctype="multipart/form-data">
                        <div class="control-group">
                            <label class="control-label" for="inputEmail">File</label>
                            <div class="controls">
				
									
								<input name="uploaded_file"  class="input-file uniform_on" id="fileInput" type="file" required>
                         
                                <input type="hidden" name="MAX_FILE_SIZE" value="1000000" />
                                <input type="hidden" name="id" value="<?php echo $post_id; ?>"/>
                                <input type="hidden" name="get_id" value="<?php echo $get_id; ?>"/>
                            </div>
                        </div>
                        <div class="control-group">
                      
                            <div class="controls">
                                <input type="text" name="name" Placeholder="File Name"  class="input" required>
                            </div>
                        </div>
                        <div class="control-group">
                          
                            <div class="controls">
                                <input type="text" name="desc" Placeholder="Description"  class="input" required>
                            </div>
                        </div>
                        <div class="control-group">
                            <div class="controls">

                                <button name="Upload" type="submit" value="Upload" class="btn btn-success" /><i class="icon-upload-alt"></i>&nbsp;Upload</button>
                            </div>
                        </div>
                    </form>
								</div>
                            </div>
                        </div>
                        <!-- /block -->
							<script>
			jQuery(document).ready(function($){
				$("#add_assignment").submit(function(e){
					e.preventDefault();
					var _this = $(e.target);
					var formData = new FormData($(this)[0]);
					$.ajax({
						type: "POST",
						url: "upload_assignment.php",
						data: formData,
						success: function(html){
							$.jGrowl("Student Successfully  Added", { header: 'Student Added' });
							window.location = 'submit_assignment.php<?php echo '?id='.$get_id.'&'.'post_id='.$post_id; ?>';
						},
						cache: false,
						contentType: false,
						processData: false
					});
				});
			});
			</script>	
		
						

	</div>
</div>