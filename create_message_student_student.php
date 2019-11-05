<div class="span3" id="">
	<div class="row-fluid">

				      <!-- block -->
                        <div class="block">
                            <div class="navbar navbar-inner block-header">
                                <div id="" class="muted pull-left"><h4><i class="icon-pencil"></i> Create Message</h4></div>
                            </div>
                            <div class="block-content collapse in">
                                <div class="span12">
								
								    <ul class="nav nav-tabs">
										<li>
											<a href="student_message.php">For Teacher</a>
										</li>
										<li class="active"><a href="student_message_student.php">For Student</a></li>
							
									</ul>
								
						

								<form method="post" id="send_message_student">
									<div class="control-group">
											<label>To:</label>
                                          <div class="controls">
                                            <select name="student_id"  class="chzn-select" required>
                                             	<option></option>
											<?php
											$query = mysql_query("select * from student order by firstname ASC");
											while($row = mysql_fetch_array($query)){
											
											?>
											<option value="<?php echo $row['student_id']; ?>"><?php echo $row['firstname']; ?> <?php echo $row['lastname']; ?> </option>
											<?php } ?>
                                            </select>
                                          </div>
                                        </div>
										
										<div class="control-group">
											<label>Content:</label>
                                          <div class="controls">
											<textarea name="my_message" class="my_message" required></textarea>
                                          </div>
                                        </div>
										<div class="control-group">
                                          <div class="controls">
												<button  class="btn btn-success"><i class="icon-envelope-alt"></i> Send </button>

                                          </div>
                                        </div>
                                </form>
												<script>
															jQuery(document).ready(function(){
															jQuery("#send_message_student").submit(function(e){
																	e.preventDefault();
																	var formData = jQuery(this).serialize();
																	$.ajax({
																		type: "POST",
																		url: "send_message_student_to_student.php",
																		data: formData,
																		success: function(html){
																		
																		$.jGrowl("Message Successfully Sended", { header: 'Message Sent' });
																		var delay = 2000;
																			setTimeout(function(){ window.location = 'student_message.php'  }, delay);  
																		}
																	});
																	return false;
																});
															});
												</script>
								
								
								</div>
                            </div>
                        </div>
                        <!-- /block -->
						

	</div>
</div>